import { db } from './index.js';
import { parcels, observations, predictions } from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const runClear = async () => {
  if (process.env.NODE_ENV === 'production') {
    console.error("ERROR: No puedes purgar la base de datos en el entorno de producción.");
    process.exit(1);
  }

  try {
    console.log("🧹 Purgando base de datos de desarrollo...");
    await db.delete(predictions);
    await db.delete(observations);
    await db.delete(parcels);
    console.log("Tablas limpiadas correctamente.");
    process.exit(0);
  } catch (error) {
    console.error("Error al limpiar la BD:", error);
    process.exit(1);
  }
};

runClear();