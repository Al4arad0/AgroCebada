import { Router } from 'express';
import { trainModel, predictYield } from '../controllers/ml.controller.js';

const router = Router();

router.post('/train', trainModel);
router.post('/predict', predictYield);

export default router;