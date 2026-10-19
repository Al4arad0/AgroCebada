import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { parcels, observations, predictions } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import csvParser from 'csv-parser';

export const importCSV = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.headers.authorization;
    if (process.env.NODE_ENV === 'production' && token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'No autorizado para importar datos.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo.' });
    }

    if (req.file.mimetype !== 'text/csv' && !req.file.originalname.toLowerCase().endsWith('.csv')) {
      fs.unlinkSync(req.file.path);
      return res.status(415).json({ error: 'El archivo debe ser un CSV válido.' });
    }

    const results: any[] = [];
    const errors: any[] = [];
    let headers: string[] = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file!.path)
        .pipe(csvParser())
        .on('headers', (h) => {
          headers = h;
          const requiredHeaders = ['ID_POLIGONO', 'AREA_HA', 'elevacion_m', 'LATITUD', 'LONGITUD'];
          const missing = requiredHeaders.filter(reqHeader => !headers.includes(reqHeader));
          if (missing.length > 0) {
            reject(new Error(`Faltan columnas obligatorias en el CSV: ${missing.join(', ')}`));
          }
        })
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    await db.transaction(async (tx) => {
      for (const [index, row] of results.entries()) {
        const name = row['ID_POLIGONO'];
        const state = row['Estado'];
        const municipality = row['Municipio'];
        const area = parseFloat(row['AREA_HA']);
        const yieldVal = parseFloat(row['RENDIMIENTO_T_HA']);
        const elevacion = parseFloat(row['elevacion_m']);
        const lat = parseFloat(row['LATITUD']);
        const lon = parseFloat(row['LONGITUD']);
        
        if (!name || isNaN(area) || isNaN(elevacion) || isNaN(lat) || isNaN(lon)) {
          errors.push({ fila: index + 2, error: `Faltan datos obligatorios para la parcela ${name || 'Desconocida'}.` });
          continue;
        }

        const insertedParcel = await tx.insert(parcels).values({
          name: name.trim(),
          state: state || 'Desconocido',
          municipality: municipality || 'Desconocido',
          latitude: lat,
          longitude: lon,
          area: area,
          elevation_m: elevacion,
          slope_deg: parseFloat(row['pendiente'] || '2')
        }).onConflictDoUpdate({
          target: parcels.name,
          set: { state: state || 'Desconocido', municipality: municipality || 'Desconocido', area, elevation_m: elevacion, latitude: lat, longitude: lon }
        }).returning();

        if (yieldVal && !isNaN(yieldVal)) {
          await tx.insert(observations).values({
            parcelId: insertedParcel[0].id,
            date: new Date(),
            cycle: '2025-2026',
            observedYield: yieldVal,
            variables: { topo_elevacion: elevacion, conjunto: row['CONJUNTO'] || 'ENTRENAMIENTO' }
          });
        }
      }
    });

    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);

    if (errors.length > 0) {
      return res.status(207).json({ message: 'Importación parcial completada', recordsProcessed: results.length - errors.length, errors });
    }

    return res.status(200).json({ message: 'Importación completada exitosamente', recordsProcessed: results.length });

  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('[Node.js] Error en importación:', error.message);
    return res.status(500).json({ error: error.message || 'Error durante la importación.' });
  }
};

export const loadFinalPredictions = async (req: Request, res: Response): Promise<any> => {
  try {
    const token = req.headers.authorization;
    if (process.env.NODE_ENV === 'production' && token !== `Bearer ${process.env.ADMIN_TOKEN}`) {
      return res.status(401).json({ error: 'No autorizado.' });
    }

    const path = process.env.OFFICIAL_PREDICTIONS_PATH || './predicciones_final.csv';
    if (!fs.existsSync(path)) {
      return res.status(404).json({ error: `Archivo oficial no encontrado en: ${path}` });
    }

    const results: any[] = [];
    const missingParcels: string[] = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(path)
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    await db.transaction(async (tx) => {
      for (const row of results) {
        const parcelName = row['ID_POLIGONO'];
        const predictedYield = parseFloat(row['RENDIMIENTO_PRED_T_HA']);

        if (!parcelName || isNaN(predictedYield)) continue;

        const parcelRecord = await tx.query.parcels.findFirst({
          where: eq(parcels.name, parcelName.trim())
        });

        if (!parcelRecord) {
          missingParcels.push(parcelName);
          continue;
        }

        await tx.insert(predictions).values({
          parcelId: parcelRecord.id,
          predictedYield: predictedYield,
          unit: 't/ha',
          modelId: 'RIDGE_TOPO_OFICIAL',
          modelVersion: 'v3.0'
        }).onConflictDoUpdate({
          target: [predictions.parcelId, predictions.modelId],
          set: { predictedYield: predictedYield, predictionDate: new Date() }
        });
      }
    });

    return res.json({ 
      success: true, 
      message: 'Predicciones oficiales cargadas.',
      recordsProcessed: results.length - missingParcels.length,
      missingParcels 
    });

  } catch (error: any) {
    return res.status(500).json({ error: 'Error cargando predicciones: ' + error.message });
  }
};