import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    goalName: {
      type: String,
      required: [true, 'Please add a goal name']
    },
    targetAmount: {
      type: Number,
      required: [true, 'Please add a target amount']
    },
    targetDate: {
      type: Date,
      required: [true, 'Please add a target date']
    },
    savedAmount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Goal', goalSchema);
