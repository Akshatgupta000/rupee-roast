import Expense from '../models/Expense.js';
import Goal from '../models/Goal.js';
import { generateRoastPrompt } from '../utils/roastPrompt.js';
import { getRoastFromGemini } from '../services/geminiService.js';
import crypto from 'crypto';

export const getRoast = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch user data
    const expenses = await Expense.find({ userId }).sort({ date: -1 }).limit(20);
    const goals = await Goal.find({ user: userId });

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

    // Ensure we always have an array for prompt formatting (prevents 500s).
    const validExpenses = Array.isArray(expenses) ? expenses : [];

    // Format data for prompt
    const expenseSummary = validExpenses.map(e => ({
      title: e.title || 'Untitled',
      amount: e.amount || 0,
      category: e.category || 'Other',
      type: e.type || 'unknown',
      date: e.date instanceof Date ? e.date.toISOString().split('T')[0] : new Date(e.date).toISOString().split('T')[0]
    }));

    const formattedGoals = Array.isArray(goals) ? goals.map(g => ({
      name: g.title || 'Unnamed Goal',
      targetAmount: g.targetAmount || 0,
      savedAmount: g.savedAmount || 0,
      deadline: `${g.deadline || 0} months`
    })) : [];

    // Create a hash of the current data state to check cache
    const dataString = JSON.stringify({ expenseSummary, currentMonthStats, formattedGoals });
    const expenseHash = crypto.createHash('md5').update(dataString).digest('hex');

    // Generate prompt
    const prompt = generateRoastPrompt(expenseSummary, currentMonthStats, formattedGoals);

    // Call Gemini Service (handles global queue, 20s cooldown, and MongoDB caching)
    const aiResponse = await getRoastFromGemini(prompt, userId, expenseHash);

    res.json(aiResponse);
  } catch (error) {
    console.error('Roast controller error:', error);
    // Avoid generic 500s for external AI failures; default to 503.
    const statusCode = error?.statusCode || 503;
    res.status(statusCode).json({
      message: error?.message || 'Failed to generate roast',
    });
  }
};
