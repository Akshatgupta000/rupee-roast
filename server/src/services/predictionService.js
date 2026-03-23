import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

/**
 * Calculates budget predictions and death clock for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Prediction data
 */
export const getBudgetPrediction = async (userId) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  // 1. Calculate Average Daily Spending (Last 30 Days)
  const recentExpenses = await Expense.find({
    userId,
    date: { $gte: thirtyDaysAgo }
  });
  
  const totalSpentLast30Days = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const avgDailySpend = totalSpentLast30Days / 30;

  // 2. Get Current Available Balance for this month
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const budget = await Budget.findOne({ 
    user: userId, 
    month: currentMonth, 
    year: currentYear 
  });
  
  const monthlyBudget = budget ? budget.monthlyBudget : 0;
  
  const currentMonthExpenses = await Expense.find({
    userId,
    date: {
      $gte: new Date(currentYear, currentMonth, 1),
      $lte: now
    }
  });
  
  const totalSpentThisMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = Math.max(0, monthlyBudget - totalSpentThisMonth);

  // 3. Predict Days Left
  let predictedDaysLeft = 0;
  let predictedHoursLeft = 0;
  
  if (avgDailySpend > 0) {
    const totalHoursLeft = (balance / avgDailySpend) * 24;
    predictedDaysLeft = Math.floor(totalHoursLeft / 24);
    predictedHoursLeft = Math.floor(totalHoursLeft % 24);
  } else if (balance > 0) {
    predictedDaysLeft = 999; // Essentially infinite if no spending
  }

  return {
    balance,
    avgDailySpend: Math.round(avgDailySpend * 100) / 100,
    predictedDaysLeft,
    predictedHoursLeft,
    warning: predictedDaysLeft < 7 ? "Danger: Your money is dying fast!" : "Safe for now, but watch out."
  };
};
