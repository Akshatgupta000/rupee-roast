import { getBudgetPrediction } from '../services/predictionService.js';
import { getFinancialHealthScore } from '../services/healthScoreService.js';

export const getPrediction = async (req, res) => {
  try {
    const prediction = await getBudgetPrediction(req.user.id);
    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getHealthScore = async (req, res) => {
  try {
    const healthData = await getFinancialHealthScore(req.user.id);
    res.json(healthData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
