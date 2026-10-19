import { Router } from 'express';
import multer from 'multer';
import { importCSV, loadFinalPredictions } from '../controllers/import.controller.js';

const router = Router();

const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/csv', upload.single('file'), importCSV);
router.post('/final-predictions', loadFinalPredictions);

export default router;