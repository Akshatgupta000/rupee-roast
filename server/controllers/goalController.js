import Goal from '../models/Goal.js';
import { analyzeGoalFeasibility } from '../services/budgetAnalyzer.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GEMINIAI_KEY);

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const goal = await Goal.create({
      user: req.user.id,
      title,
      targetAmount,
      deadline
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const saveToGoal = async (req, res) => {
  try {
    const { goalId, amount } = req.body;

    if (!goalId || amount === undefined || amount <= 0) {
      return res.status(400).json({ message: 'Please provide valid goalId and amount' });
    }

    const goal = await Goal.findById(goalId);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    if (goal.savedAmount + amount > goal.targetAmount) {
      return res.status(400).json({ message: 'Cannot save more than the target amount' });
    }

    goal.savedAmount += amount;
    
    if (goal.savedAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    await goal.save();

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getGoalAnalysis = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.goalId);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const analysis = await analyzeGoalFeasibility(req.user.id, goal);

    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ roast: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Roast failed due to server error or missing API key', error: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await goal.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
