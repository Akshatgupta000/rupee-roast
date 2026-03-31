import express from 'express';
import { getPrediction, getHealthScore, getSummary } from '../controllers/financeController.js';
import { getAdvice } from '../controllers/adviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimit.js';

const router = express.Router();

router.use(protect);

router.get('/predict-budget', getPrediction);
router.get('/health-score', getHealthScore);
router.post('/advice', aiRateLimiter, getAdvice);
router.get('/summary', getSummary);

export default router;
