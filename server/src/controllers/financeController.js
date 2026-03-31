import Expense from '../models/Expense.js';
import { buildFinanceSummary } from '../services/financeAnalyticsService.js';
import { getBudgetPrediction } from '../services/predictionService.js';
import { getFinancialHealthScore } from '../services/healthScoreService.js';

export const getPrediction = async (req, res) => {
  try {
    const prediction = await getBudgetPrediction(req.user.id);
    return res.json({ success: true, data: prediction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getHealthScore = async (req, res) => {
  try {
    const healthData = await getFinancialHealthScore(req.user.id);
    return res.json({ success: true, data: healthData });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getSummary = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(500);
    const summary = buildFinanceSummary({ expenses });
    return res.json({ success: true, data: summary });
  } catch (error) {
    return next(error);
  }
};
