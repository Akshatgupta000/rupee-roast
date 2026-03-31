import express from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All expense routes are protected

router.route('/').get(getExpenses).post(createExpense);

// Spec aliases
router.route('/add').post(createExpense);
router.route('/list').get(getExpenses);

router.route('/:id').put(updateExpense).delete(deleteExpense);

export default router;
