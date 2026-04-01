import Budget from '../models/Budget.js';

export const setBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;
    
    if (monthlyBudget === undefined || monthlyBudget < 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid monthly budget' });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let budget = await Budget.findOne({
      user: req.user.id,
      month: currentMonth,
      year: currentYear
    });

    if (budget) {
      budget.monthlyBudget = monthlyBudget;
      await budget.save();
    } else {
      budget = await Budget.create({
        user: req.user.id,
        monthlyBudget,
        month: currentMonth,
        year: currentYear
      });
    }

    return res.status(200).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentBudget = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const budget = await Budget.findOne({
      user: req.user.id,
      month: currentMonth,
      year: currentYear
    });

    if (!budget) {
      // Optional: return 0 if no budget is set
      return res.status(200).json({ success: true, data: { monthlyBudget: 0 } });
    }

    return res.status(200).json({ success: true, data: budget });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
