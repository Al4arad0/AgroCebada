import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { parcels, observations, predictions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export const createParcel = async (req: Request, res: Response) => {
  try {
    const { name, state, municipality, latitude, longitude, area, topo_elevacion, topo_pendiente } = req.body;
    
    // Validación de entrada
    if (!name || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude)) || parseFloat(area) <= 0) {
      return res.status(400).json({ error: 'Datos inválidos. Verifica nombre, coordenadas o área.' });
    }

    // Usamos una Transacción para asegurar atomicidad
    const result = await db.transaction(async (tx) => {
      const newParcel = await tx.insert(parcels).values({
        name: name.trim(),
        state,
        municipality,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        area: parseFloat(area),
        elevation_m: parseFloat(topo_elevacion || '2600'),
        slope_deg: parseFloat(topo_pendiente || '2')
      }).returning();

      const parcelId = newParcel[0].id;

      await tx.insert(observations).values({
        parcelId: parcelId,
        date: new Date(),
        cycle: '2026-2027',
        variables: {
          topo_elevacion: parseFloat(topo_elevacion || '2600'),
          topo_pendiente: parseFloat(topo_pendiente || '2')
        }
      });

      return newParcel[0];
    });

    // Petición a Python fuera de la transacción
    let warning = null;
    let savedPrediction = null;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const pythonResponse = await fetch(`${ML_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parcelId: result.name,
          topo_elevacion: result.elevation_m,
          topo_pendiente: result.slope_deg
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (pythonResponse.ok) {
        const data = await pythonResponse.json();
        
        if (data.zonaAsignada === false) {
          warning = data.advertencia;
        }

        const predYield = parseFloat(data.predictedYield);
        if (!isNaN(predYield) && predYield > 0) {
          // Upsert en caso de existir
          const inserted = await db.insert(predictions).values({
            parcelId: result.id,
            predictedYield: predYield,
            unit: 't/ha',
            modelId: 'RIDGE_TOPO_V3_AUTO',
            modelVersion: 'v3.0',
            featuresSnapshot: {
              elevacion: result.elevation_m,
              pendiente: result.slope_deg,
              zona: data.zona,
              zonaAsignada: data.zonaAsignada
            }
          }).onConflictDoUpdate({
            target: [predictions.parcelId, predictions.modelId],
            set: {
              predictedYield: predYield,
              featuresSnapshot: { elevacion: result.elevation_m, pendiente: result.slope_deg, zona: data.zona, zonaAsignada: data.zonaAsignada },
              predictionDate: new Date()
            }
          }).returning();
          savedPrediction = inserted[0];
        }
      }
    } catch (mlError) {
      console.error('[Node.js] Error ML:', mlError);
      warning = "Servicio de predicción no disponible. La parcela se guardó sin estimación.";
    }

    res.status(201).json({ success: true, parcel: result, prediction: savedPrediction, warning });
  } catch (error: any) {
    if (error.code === '23505') return res.status(409).json({ error: 'Ya existe una parcela registrada con este ID.' });
    res.status(500).json({ error: 'Error interno del servidor al crear la parcela.' });
  }
};

export const getParcels = async (req: Request, res: Response) => {
  try {
    const allParcels = await db.query.parcels.findMany({
      with: {
        observations: true,
        predictions: {
          orderBy: (predictions, { desc }) => [desc(predictions.predictionDate)]
        }
      }
    });
    res.json(allParcels);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener parcelas' });
  }
};