import { useState, useEffect } from 'react';
import { parcelService } from '../services/api';

export const normalizeId = (id: string) => {
  if (!id) return '';
  return String(id).trim().replace(/[_-\s]/g, '').toUpperCase();
};

export const useParcelsData = () => {
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      let geoMap: Record<string, any> = {};
      try {
        const geoRes = await fetch('/parcelas.geojson');
        if (geoRes.ok) {
          const geoJson = await geoRes.json();
          (geoJson.features || []).forEach((f: any) => {
            const p = f.properties || {};
            const id = p.ID_POLIGON || p.ID_POLIGONO || p.ID;
            if (id) geoMap[normalizeId(id)] = p;
          });
        }
      } catch (e) {
        console.warn("No se pudo cargar parcelas.geojson");
      }

      let zonasMap: Record<string, string> = {};
      try {
        const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
        const pyRes = await fetch(`${API_BASE}/models/geoparams`);
        if (pyRes.ok) {
          const pyData = await pyRes.json();
          zonasMap = pyData.mapa_zonas || {};
        }
      } catch (e) {
        console.warn("No se pudieron cargar las zonas de Python");
      }

      const rawParcels = await parcelService.getParcels();
      
      const enriched = rawParcels.map((p: any) => {
        const normId = normalizeId(p.name);
        const geoProps = geoMap[normId] || {};
        const obs = p.observations?.[0] || {};
        const vars = obs.variables || {};
        
        const preds = p.predictions || [];
        const oficial = preds.find((pr: any) => pr.modelId === 'RIDGE_TOPO_OFICIAL');
        const enVivo = preds.find((pr: any) => pr.modelId === 'RIDGE_TOPO_V3_AUTO' || pr.modelId === 'RIDGE_TOPO_V3');
        
        const yieldOficial = oficial ? Number(oficial.predictedYield) : null;
        const yieldEnVivo = enVivo ? Number(enVivo.predictedYield) : null;
        
        // Búsqueda flexible de rendimiento observado (BD o GeoJSON)
        let observedFromGeo: number | null = null;
        for (const [k, v] of Object.entries(geoProps)) {
          if (k.toLowerCase().includes('rend') && v !== null && v !== '') {
            const parsed = parseFloat(String(v));
            if (!isNaN(parsed) && parsed > 0) {
              observedFromGeo = parsed;
              break;
            }
          }
        }

        const observed = obs.observedYield != null ? Number(obs.observedYield) : observedFromGeo;
        const isPrediction = observed === null;
        
        return {
          id: p.id,
          name: p.name,
          state: geoProps.Estado || geoProps.ESTADO || p.state || 'Sin dato',
          municipality: geoProps.Municipio || geoProps.MUNICIPIO || p.municipality || 'Sin dato',
          area: Number(geoProps.área_ha || geoProps.area_ha || p.area || 0),
          elevacion: Number(vars.topo_elevacion || p.elevation_m || geoProps.elevacion_m || 0),
          pendiente: Number(vars.topo_pendiente || p.slope_deg || 0),
          zona: zonasMap[normId] || '0', 
          conjunto: isPrediction ? 'PRED' : 'ENTR',
          rendimientoObservado: observed,
          rendimientoOficial: yieldOficial,
          rendimientoEnVivo: yieldEnVivo,
          mejorEstimacion: yieldOficial !== null ? yieldOficial : yieldEnVivo,
          latitude: Number(p.latitude || 0),
          longitude: Number(p.longitude || 0),
          hasPolygon: !!geoMap[normId]
        };
      });

      enriched.sort((a: any, b: any) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      
      setParcels(enriched);
    } catch (err: any) {
      setError(err.message || "Error de conexión al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return { parcels, loading, error, reload: loadData };
};