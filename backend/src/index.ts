
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';
import express, { Request, Response } from 'express';

// Importación de routers
import parcelRoutes from './routes/parcel.routes.js';
// Asegúrate de exportar correctamente mlRoutes e importRoutes en sus respectivos archivos
import mlRoutes from './routes/ml.routes.js'; 
import importRoutes from './routes/import.routes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// 1. Health check con validación real de DB
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: 'OK', service: 'AgroCebada Backend', db: 'Connected', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', service: 'AgroCebada Backend', db: 'Disconnected' });
  }
});

// 2. Puente seguro para parámetros geográficos (evita llamadas directas del frontend a Python)
app.get('/api/models/geoparams', async (req: Request, res: Response) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const pyRes = await fetch(`${ML_URL}/geoparams`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!pyRes.ok) throw new Error('Error en ML API');
    const data = await pyRes.json();
    return res.json(data);
  } catch (error) {
    res.status(502).json({ error: 'Servicio de ML no disponible.' });
  }
});

// Montaje de Routers
app.use('/api/parcels', parcelRoutes);
app.use('/api/models', mlRoutes);
app.use('/api/import', importRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Backend en puerto ${PORT}`);
});