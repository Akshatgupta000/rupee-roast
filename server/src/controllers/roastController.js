import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import RoastCache from '../models/RoastCache.js';
import { generateRoastWithCache } from '../services/roastGenerationService.js';

export const generateRoast = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const roastMode = req.body?.roastMode || 'chill';
    const forceRefresh = req.body?.forceRefresh || false;

    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(50);
    const goals = await Goal.find({ user: userId });

    const ai = await generateRoastWithCache({ userId, expenses, goals, roastMode, forceRefresh });
    return res.json({
      success: true,
      data: {
        roast: ai.roast,
        insight: ai.insight,
        suggestion: ai.suggestion,
      },
      // Backwards-compatible top-level aliases.
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

export const getLatestRoast = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const latest = await RoastCache.findOne({ userId }).sort({ createdAt: -1 });

    if (!latest) {
      return res.status(404).json({
        success: false,
        message: 'No roast found yet. Generate one first.',
      });
    }

    return res.json({
      success: true,
      data: {
        roast: latest.roast,
        insight: latest.insight,
        suggestion: latest.suggestion,
      },
      roast: latest.roast,
      insight: latest.insight,
      advice: latest.insight,
      suggestion: latest.suggestion,
      cached: true,
      fallbackUsed: false,
      createdAt: latest.createdAt,
    });
  } catch (error) {
    return next(error);
  }
};

// Backwards-compatible alias: POST /api/roast
export const getRoast = generateRoast;
