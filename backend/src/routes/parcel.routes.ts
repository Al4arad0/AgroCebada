import { Router, Request, Response } from 'express';
import { createParcel, getParcels } from '../controllers/parcel.controller.js';
import { db } from '../db/index.js';
import { parcels, observations, predictions } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/', createParcel);
router.get('/', getParcels);

// Integración de la eliminación en cascada de parcelas
router.delete('/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    await db.delete(predictions).where(eq(predictions.parcelId, id));
    await db.delete(observations).where(eq(observations.parcelId, id));
    const deletedParcel = await db.delete(parcels).where(eq(parcels.id, id)).returning();
    
    if (deletedParcel.length === 0) {
      return res.status(404).json({ error: 'Parcela no encontrada' });
    }
    return res.json({ success: true, message: 'Parcela eliminada correctamente' });
  } catch (error) {
    console.error('[Node.js] Error al eliminar parcela:', error);
    return res.status(500).json({ error: 'Error al eliminar la parcela' });
  }
});

export default router;