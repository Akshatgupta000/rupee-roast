import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    monthlyBudget: {
      type: Number,
      required: [true, 'Please add a monthly budget amount'],
      min: [0, 'Budget cannot be negative']
    },
    month: {
      type: Number,
      required: true
    },
    year: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure only one budget per month per user
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
