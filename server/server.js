import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import errorMiddleware from './src/middleware/errorMiddleware.js';

import authRoutes from './src/routes/authRoutes.js';
import expenseRoutes from './src/routes/expenseRoutes.js';
import goalRoutes from './src/routes/goalRoutes.js';
import roastRoutes from './src/routes/roastRoutes.js';
import budgetRoutes from './src/routes/budgetRoutes.js';
import financeRoutes from './src/routes/financeRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.CLIENT_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/roast', roastRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/finance', financeRoutes);

// Spec-friendly aliases
app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/goals', goalRoutes);
app.use('/roast', roastRoutes);
app.use('/budget', budgetRoutes);
app.use('/finance', financeRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK' }));
app.get('/', (req, res) => res.send('Rupee Roast API is running...'));

app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
