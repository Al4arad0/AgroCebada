import { db } from './config/db';
import { sql } from 'drizzle-orm';
async function limpiar() { 
  await db.execute(sql`TRUNCATE TABLE observations, parcels CASCADE;`); 
  console.log("✅ BASE DE DATOS LIMPIA. 0 PARCELAS.");
  process.exit(0); 
}
limpiar();