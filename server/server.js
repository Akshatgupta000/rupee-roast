import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
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

// ─── 1. CORS — MUST come before express.json() so preflight OPTIONS requests
//     are handled before any body parsing occurs. ────────────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.CLIENT_URL
];

const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options("/{*splat}", cors(corsOptions));

// ─── 2. Body Parsing ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── 3. Request Logger ────────────────────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ─── 4. Health Check ──────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// ─── 5. API Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/roast', roastRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/finance', financeRoutes);

// ─── 6. Root ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('Rupee Roast API is running...');
});

// ─── 7. Global Error Handler (must be last) ───────────────────────────────
app.use(errorMiddleware);

// ─── 8. Start ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Backend] Server running on port ${PORT}`);
});

