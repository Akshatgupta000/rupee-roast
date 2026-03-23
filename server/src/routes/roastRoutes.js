import express from 'express';
import { getRoast } from '../controllers/roastController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Route is protected

router.post('/', getRoast);

export default router;
