import express from 'express';
import { getPrediction, getHealthScore } from '../controllers/financeController.js';
import { getAdvice } from '../controllers/adviceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/predict-budget', getPrediction);
router.get('/health-score', getHealthScore);
router.post('/advice', getAdvice);

export default router;
