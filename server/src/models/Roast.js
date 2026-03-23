import mongoose from 'mongoose';

const roastSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  roast: { 
    type: String, 
    required: true 
  },
  advice: { 
    type: String, 
    required: true 
  },
  suggestion: { 
    type: String, 
    required: true 
  },
  expenseHash: { 
    type: String, 
    required: true 
  },
}, { 
  timestamps: true 
});

// Index by userId and expenseHash for fast lookups
roastSchema.index({ userId: 1, expenseHash: 1 });

export default mongoose.model('Roast', roastSchema);
