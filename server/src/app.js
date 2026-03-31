import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import fs from 'fs';
import path from 'path';

// Manual logger to file
const logFile = path.resolve('server_debug.log');
const logStream = fs.createWriteStream(logFile, { flags: 'a' });
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = (...args) => {
  const msg = `[LOG] ${new Date().toISOString()}: ${args.join(' ')}\n`;
  logStream.write(msg);
  originalLog(...args);
};
console.error = (...args) => {
  const msg = `[ERR] ${new Date().toISOString()}: ${args.join(' ')}\n`;
  logStream.write(msg);
  originalError(...args);
};
console.warn = (...args) => {
  const msg = `[WRN] ${new Date().toISOString()}: ${args.join(' ')}\n`;
  logStream.write(msg);
  originalWarn(...args);
};

import authRoutes from './routes/authRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import goalRoutes from './routes/goalRoutes.js';
import roastRoutes from './routes/roastRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import financeRoutes from './routes/financeRoutes.js';

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/roast', roastRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/finance', financeRoutes);

// Spec-friendly aliases (no /api prefix)
app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);
app.use('/goals', goalRoutes);
app.use('/roast', roastRoutes);
app.use('/budget', budgetRoutes);
app.use('/finance', financeRoutes);

app.get('/', (req, res) => res.send('Rupee Roast API is running...'));

// Error handling middleware (must be registered before starting the server)
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
