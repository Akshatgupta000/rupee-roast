import Goal from '../models/Goal.js';

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ targetDate: 1 });
    
    // Calculate monthly savings required for each goal dynamically
    const goalsWithCalculations = goals.map(goal => {
      const remainingAmount = goal.targetAmount - goal.savedAmount;
      const today = new Date();
      const target = new Date(goal.targetDate);
      
      let monthsRemaining = (target.getFullYear() - today.getFullYear()) * 12 + target.getMonth() - today.getMonth();
      if (monthsRemaining <= 0) monthsRemaining = 1; // Prevent division by zero, assume at least 1 month if due soon
      
      const monthlySavingRequired = remainingAmount / monthsRemaining;

      return {
        ...goal._doc,
        monthlySavingRequired: monthlySavingRequired > 0 ? monthlySavingRequired : 0
      };
    });

    res.json(goalsWithCalculations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { goalName, targetAmount, targetDate, savedAmount } = req.body;

    if (!goalName || !targetAmount || !targetDate) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const goal = await Goal.create({
      userId: req.user.id,
      goalName,
      targetAmount,
      targetDate,
      savedAmount: savedAmount || 0
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedGoal = await Goal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await goal.deleteOne();

    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
