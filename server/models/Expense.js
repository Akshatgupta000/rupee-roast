import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: [true, 'Please add a title']
    },
    amount: {
      type: Number,
      required: [true, 'Please add an amount']
    },
    category: {
      type: String,
      required: [true, 'Please add a category']
    },
    type: {
      type: String,
      enum: ['necessary', 'impulsive'],
      required: [true, 'Please specify if necessary or impulsive']
    },
    date: {
      type: Date,
      required: [true, 'Please add a date'],
      default: Date.now
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Expense', expenseSchema);
