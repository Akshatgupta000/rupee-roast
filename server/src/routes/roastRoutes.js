import express from 'express';
import { generateRoast, getLatestRoast } from '../controllers/roastController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimit.js';

const router = express.Router();

router.use(protect); // Route is protected

router.post('/generate', aiRateLimiter, generateRoast);

// Backwards-compatible alias: POST /api/roast
router.post('/', aiRateLimiter, generateRoast);

router.get('/latest', getLatestRoast);

export default router;
