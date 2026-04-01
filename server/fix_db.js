import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const fixIt = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    // The collection name usually matches the model name (plural lowercased)
    // Budget -> budgets
    const collection = mongoose.connection.collection('budgets');
    
    // Drop all indexes except _id
    await collection.dropIndexes();
    console.log('Successfully dropped all indexes on budgets collection.');
    
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing db:', error);
    process.exit(1);
  }
};

fixIt();
