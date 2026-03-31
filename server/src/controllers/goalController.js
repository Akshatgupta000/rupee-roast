import Goal from '../models/Goal.js';
import { analyzeGoalFeasibility } from '../services/budgetAnalyzer.js';
import { generateTextFromGemini } from '../services/geminiService.js';

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount,
      deadline
    });

    return res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveToGoal = async (req, res) => {
  try {
    const { goalId, amount } = req.body;

    if (!goalId || amount === undefined || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide valid goalId and amount' });
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    if (goal.savedAmount + amount > goal.targetAmount) {
      return res.status(400).json({ success: false, message: 'Cannot save more than the target amount' });
    }

    goal.savedAmount += amount;
    
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    return res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGoalAnalysis = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    const analysis = await analyzeGoalFeasibility(req.user.id, goal);

    return res.json({ success: true, data: analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const roastGoal = async (req, res) => {
  try {
    const { budget, spending, goalTitle, targetAmount, remainingAmount, monthsLeft } = req.body;
    
    const prompt = `User budget: ₹${budget || 0}
Current spending: ₹${spending || 0}
Goal: ${goalTitle} ₹${targetAmount}
Remaining target: ₹${remainingAmount}
Months left: ${monthsLeft}

Roast the user in a funny Indian dad + GenZ tone for their financial decisions regarding this goal.
Make it hilarious and insulting about their spending habits versus what they want to achieve.
Keep it short (2-3 sentences max).`;

    const text = await generateTextFromGemini(prompt);
    const roast = String(text ?? '').trim();
    return res.json({ success: true, data: { roast }, roast });
  } catch (error) {
    console.error('Goal roast error:', error);
    return res.status(error?.statusCode || 503).json({
      success: false,
      message: error?.message || 'Roast failed due to server error',
    });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authorized' });
    }

    await goal.deleteOne();

    return res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
