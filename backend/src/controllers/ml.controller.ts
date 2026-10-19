import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { predictions } from '../db/schema.js';

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

export const trainModel = async (req: Request, res: Response): Promise<any> => {
  return res.json({
    success: true,
    message: "Entrenamiento desactivado en producción. Se usa el modelo V3 pre-entrenado."
  });
};

export const predictYield = async (req: Request, res: Response): Promise<any> => {
  const { parcelId, name, topo_elevacion, topo_pendiente } = req.body;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const pythonResponse = await fetch(`${ML_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parcelId: name || "",
        topo_elevacion: parseFloat(topo_elevacion || '2600'),
        topo_pendiente: parseFloat(topo_pendiente || '2')
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      throw new Error(errorText || 'Error interno en el servidor Python');
    }

    const predictionData = await pythonResponse.json();
    const predYield = parseFloat(predictionData.predictedYield);

    let savedPrediction = null;
    if (parcelId && !isNaN(predYield)) {
      const inserted = await db.insert(predictions).values({
        parcelId: parcelId,
        predictedYield: predYield,
        unit: 't/ha',
        modelId: 'RIDGE_TOPO_V3',
        modelVersion: 'v3.0',
        featuresSnapshot: {
          elevacion: parseFloat(topo_elevacion || '2600'),
          pendiente: parseFloat(topo_pendiente || '2'),
          zona: predictionData.zona,
          zonaAsignada: predictionData.zonaAsignada
        }
      }).onConflictDoUpdate({
        target: [predictions.parcelId, predictions.modelId],
        set: {
          predictedYield: predYield,
          featuresSnapshot: { elevacion: parseFloat(topo_elevacion || '2600'), pendiente: parseFloat(topo_pendiente || '2'), zona: predictionData.zona, zonaAsignada: predictionData.zonaAsignada },
          predictionDate: new Date()
        }
      }).returning();
      savedPrediction = inserted[0];
    }

    return res.json({
      success: true,
      data: {
        predictedYield: predYield,
        unit: 't/ha',
        predictionRecordId: savedPrediction ? savedPrediction.id : null,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('[Node.js] Error al generar la predicción:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || 'Error desconocido al predecir'
    });
  }
};