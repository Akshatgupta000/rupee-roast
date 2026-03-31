import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import { generateRoastWithCache } from '../services/roastGenerationService.js';

// Backwards-compatible endpoint: POST /api/finance/advice
export const getAdvice = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roastMode = req.body?.roastMode || 'chill';
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(50);
    const goals = await Goal.find({ user: userId });

    const ai = await generateRoastWithCache({ userId, expenses, goals, roastMode });
    return res.json({
      success: true,
      data: {
        roast: ai.roast,
        insight: ai.insight,
        suggestion: ai.suggestion,
      },
      roast: ai.roast,
      insight: ai.insight,
      advice: ai.insight,
      suggestion: ai.suggestion,
      cached: ai.cached,
      fallbackUsed: ai.fallbackUsed,
    });
  } catch (error) {
    return next(error);
  }
};
