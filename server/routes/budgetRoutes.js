import express from 'express';
import { setBudget, getCurrentBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/set', setBudget);
router.get('/current', getCurrentBudget);

export default router;
