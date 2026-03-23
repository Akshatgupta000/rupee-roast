import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    title: {
      type: String,
      required: [true, 'Please add a goal title']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please add a target amount'],
      min: [0, 'Target amount cannot be negative']
    },
    savedAmount: {
      type: Number,
      default: 0,
      min: [0, 'Saved amount cannot be negative']
    },
    deadline: {
      type: Number,
      required: [true, 'Please add a deadline in months']
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Goal', goalSchema);
