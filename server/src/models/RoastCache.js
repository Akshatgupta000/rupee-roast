import mongoose from 'mongoose';

const roastCacheSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expenseHash: { type: String, required: true },

    roast: { type: String, required: true },
    insight: { type: String, required: true },
    suggestion: { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

roastCacheSchema.index({ userId: 1, expenseHash: 1 }, { unique: true });
roastCacheSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('RoastCache', roastCacheSchema);

