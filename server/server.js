import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import roastRoutes from './routes/roastRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import financeRoutes from './routes/financeRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/roast', roastRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/finance', financeRoutes);

app.get('/', (req, res) => res.send('Rupee Roast API is running...'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
