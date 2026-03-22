import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import { generateRoastPrompt } from '../utils/roastPrompt.js';
import { getRoastFromGemini } from '../services/geminiService.js';

export const getRoast = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user data
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(20);
    const goals = await Goal.find({ userId });

    // Calculate monthly stats
    const currentMonthStats = expenses.reduce(
      (acc, expense) => {
        const month = expense.date.getMonth();
        const currentMonth = new Date().getMonth();
        if (month === currentMonth) {
          acc.totalSpent += expense.amount;
          if (expense.type === 'impulsive') acc.impulsiveSpent += expense.amount;
          if (expense.type === 'necessary') acc.necessarySpent += expense.amount;
          
          if(!acc.categoryBreakdown[expense.category]) acc.categoryBreakdown[expense.category] = 0;
          acc.categoryBreakdown[expense.category] += expense.amount;
        }
        return acc;
      },
      { totalSpent: 0, impulsiveSpent: 0, necessarySpent: 0, categoryBreakdown: {} }
    );

    // Format data for prompt
    const expenseSummary = expenses.map(e => ({
      title: e.title,
      amount: e.amount,
      category: e.category,
      type: e.type,
      date: e.date.toISOString().split('T')[0]
    }));

    const formattedGoals = goals.map(g => ({
      name: g.goalName,
      targetAmount: g.targetAmount,
      savedAmount: g.savedAmount,
      targetDate: g.targetDate.toISOString().split('T')[0]
    }));

    // Generate prompt
    const prompt = generateRoastPrompt(expenseSummary, currentMonthStats, formattedGoals);

    // Call Gemini Service
    const aiResponse = await getRoastFromGemini(prompt);

    res.json(aiResponse);
  } catch (error) {
    console.error('Roast controller error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate roast' });
  }
};
