import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

/**
 * Calculates budget predictions and death clock for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Prediction data
 */
export const getBudgetPrediction = async (userId) => {
  const now = new Date();
  
  // 1. Get Current Available Balance for this month
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();
  
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

  // 2. Calculate Average Daily Spending (Current Month)
  const avgDailySpend = totalSpentThisMonth / Math.max(1, currentDay);

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
