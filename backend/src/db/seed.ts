import { db } from './index.js';
import { parcels, observations, predictions } from './schema.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function getCentroid(geometry: any): { lat: number; lng: number } {
  if (!geometry || !geometry.coordinates) return { lat: 19.5, lng: -98.4 };
  let coords: [number, number][] = [];
  if (geometry.type === 'Polygon') coords = geometry.coordinates[0];
  else if (geometry.type === 'MultiPolygon') coords = geometry.coordinates[0][0];
  else if (geometry.type === 'Point') return { lng: geometry.coordinates[0], lat: geometry.coordinates[1] };
  if (!coords || coords.length === 0) return { lat: 19.5, lng: -98.4 };

  let sumLat = 0, sumLng = 0;
  coords.forEach(([lng, lat]: [number, number]) => { sumLng += lng; sumLat += lat; });
  return { lat: Number((sumLat / coords.length).toFixed(6)), lng: Number((sumLng / coords.length).toFixed(6)) };
}

const seedDatabase = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error("❌ ERROR: No se puede ejecutar seed en producción.");
    process.exit(1);
  }

  console.log("🌱 Iniciando siembra corregida de AgroCebada...");

  const geojsonCandidates = [
    path.resolve(process.cwd(), '../frontend/public/parcelas.geojson'),
    path.resolve(process.cwd(), './public/parcelas.geojson'),
    path.resolve(process.cwd(), 'parcelas.geojson')
  ];
  const geojsonPath = geojsonCandidates.find(p => fs.existsSync(p));
  if (!geojsonPath) {
    console.error("❌ ERROR: No se encontró 'parcelas.geojson'.");
    process.exit(1);
  }

  const csvCandidates = [
    path.resolve(process.cwd(), 'predicciones_final.csv'),
    path.resolve(process.cwd(), '../predicciones_final.csv')
  ];
  const csvPath = csvCandidates.find(p => p && fs.existsSync(p));
  const officialPredictionsMap: Record<string, number> = {};

  if (csvPath) {
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    for (let i = 1; i < lines.length; i++) {
      const [id, yieldVal] = lines[i].split(',');
      if (id && yieldVal) {
        officialPredictionsMap[id.trim().replace(/[_-\s]/g, '').toUpperCase()] = parseFloat(yieldVal.trim());
      }
    }
  }

  const rendCsvCandidates = [
    path.resolve(process.cwd(), 'ID_area_rendimiento_70_30_Reto_AgroCebada.csv'),
    path.resolve(process.cwd(), '../ID_area_rendimiento_70_30_Reto_AgroCebada.csv')
  ];
  const rendCsvPath = rendCsvCandidates.find(p => fs.existsSync(p));
  const trainingMap: Record<string, { yield: number | null, conjunto: string }> = {};

  if (rendCsvPath) {
    const rContent = fs.readFileSync(rendCsvPath, 'utf-8');
    const rLines = rContent.split(/\r?\n/).filter(l => l.trim().length > 0);
    const header = rLines[0].split(',');
    
    const idIdx = header.findIndex(h => h.toUpperCase().includes('POLIGON') || h.toUpperCase() === 'ID');
    const yIdx = header.findIndex(h => h.toUpperCase().includes('REND'));
    const conjIdx = header.findIndex(h => h.toUpperCase().includes('CONJUNTO'));

    if (idIdx !== -1) {
      for (let i = 1; i < rLines.length; i++) {
        const parts = rLines[i].split(',');
        const rawId = parts[idIdx]?.trim();
        if (!rawId) continue;
        const normId = rawId.replace(/[_-\s]/g, '').toUpperCase();
        
        let val = null;
        if (yIdx !== -1 && parts[yIdx]) {
          const parsed = parseFloat(parts[yIdx]);
          if (!isNaN(parsed) && parsed > 0) val = parsed;
        }
        
        let conj = 'ENTRENAMIENTO';
        if (conjIdx !== -1 && parts[conjIdx]) {
          conj = parts[conjIdx].trim().toUpperCase();
        }
        trainingMap[normId] = { yield: val, conjunto: conj };
      }
    }
  }

  const paramsCandidates = [
    path.resolve(process.cwd(), 'parametros_geograficos_v3.json'),
    path.resolve(process.cwd(), '../parametros_geograficos_v3.json'),
    path.resolve(process.cwd(), '../ml/parametros_geograficos_v3.json')
  ];
  const paramsPath = paramsCandidates.find(p => fs.existsSync(p));
  let geoParams: any = null;
  if (paramsPath) {
    geoParams = JSON.parse(fs.readFileSync(paramsPath, 'utf-8'));
  }

  const geoData = JSON.parse(fs.readFileSync(geojsonPath, 'utf-8'));
  const features = geoData.features || [];

  let insertedParcels = 0, insertedObservations = 0, insertedPredictions = 0;

  try {
    await db.transaction(async (tx) => {
      await tx.delete(predictions);
      await tx.delete(observations);
      await tx.delete(parcels);

      for (const f of features) {
        const props = f.properties || {};
        const rawId = props.ID_POLIGON || props.ID_POLIGONO || props.ID;
        if (!rawId) continue;

        const name = String(rawId).trim();
        const normId = name.replace(/[_-\s]/g, '').toUpperCase();
        const centroid = getCentroid(f.geometry);

        const state = props.Estado || props.ESTADO || 'Hidalgo';
        const municipality = props.Municipio || props.MUNICIPIO || 'Sin dato';
        
        let area = 0;
        for (const [k, v] of Object.entries(props)) {
          if (k.toLowerCase().includes('area') && v !== null && v !== '') {
            const parsed = parseFloat(String(v));
            if (!isNaN(parsed)) area = parsed;
          }
        }

        let elevacion = 2600;
        let pendiente = 2.0;

        for (const [k, v] of Object.entries(props)) {
          const key = k.toLowerCase();
          if (key.includes('elev') && v !== null && v !== '') {
            const parsed = parseFloat(String(v));
            if (!isNaN(parsed)) elevacion = parsed;
          }
          if (key.includes('pend') && v !== null && v !== '') {
            const parsed = parseFloat(String(v));
            if (!isNaN(parsed)) pendiente = parsed;
          }
        }

        if (elevacion === 2600 && geoParams && geoParams.mapa_zonas) {
          const zona = geoParams.mapa_zonas[normId] ?? geoParams.mapa_zonas[name];
          if (zona !== undefined) {
            if (geoParams.medianas_elevacion && geoParams.medianas_elevacion[String(zona)]) {
              elevacion = geoParams.medianas_elevacion[String(zona)];
            }
            if (geoParams.medianas_pendiente && geoParams.medianas_pendiente[String(zona)]) {
              pendiente = geoParams.medianas_pendiente[String(zona)];
            }
          }
        }

        const tMap = trainingMap[normId];
        const conjuntoFinal = tMap ? tMap.conjunto : (props.CONJUNTO ? String(props.CONJUNTO).toUpperCase() : 'ENTRENAMIENTO');
        const rendimientoObs = tMap && tMap.yield ? tMap.yield : null;

        const newParcel = await tx.insert(parcels).values({
          name, state, municipality, latitude: centroid.lat, longitude: centroid.lng,
          area: isNaN(area) ? 0 : area, elevation_m: isNaN(elevacion) ? 2600 : elevacion, slope_deg: isNaN(pendiente) ? 2 : pendiente
        }).returning();

        const parcelId = newParcel[0].id;
        insertedParcels++;

        if (conjuntoFinal.includes('ENTR') && rendimientoObs !== null) {
          await tx.insert(observations).values({
            parcelId, date: new Date('2025-10-15'), cycle: '2025-2026',
            observedYield: rendimientoObs, yieldUnit: 't/ha',
            variables: { topo_elevacion: elevacion, topo_pendiente: pendiente, conjunto: 'ENTRENAMIENTO' }
          });
          insertedObservations++;
        }

        if (officialPredictionsMap[normId] !== undefined) {
          await tx.insert(predictions).values({
            parcelId, predictionDate: new Date('2026-10-18'),
            predictedYield: officialPredictionsMap[normId], unit: 't/ha',
            modelId: 'RIDGE_TOPO_OFICIAL', modelVersion: 'v3.0',
            featuresSnapshot: { topo_elevacion: elevacion, topo_pendiente: pendiente, fuente: 'predicciones_final.csv' }
          });
          insertedPredictions++;
        }
      }
    });

    console.log("✅ Siembra completada con éxito:");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error en seed:", error);
    process.exit(1);
  }
};

seedDatabase();