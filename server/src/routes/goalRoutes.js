import express from 'express';
import {
  getGoals,
  createGoal,
  saveToGoal,
  getGoalAnalysis,
  roastGoal,
  deleteGoal
} from '../controllers/goalController.js';
import { protect } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimit.js';

const router = express.Router();

router.use(protect); // All goal routes are protected

// Keep classic REST layout plus custom routes
router.route('/').get(getGoals);
router.route('/list').get(getGoals);
router.route('/create').post(createGoal); // Specific /create per spec
router.route('/save').patch(saveToGoal);
router.route('/analysis/:goalId').get(getGoalAnalysis);
router.route('/roast').post(aiRateLimiter, roastGoal);
router.route('/:id').delete(deleteGoal);

export default router;
