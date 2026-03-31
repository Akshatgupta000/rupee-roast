import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!process.env.JWT_SECRET) {
        const e = new Error('JWT_SECRET is not configured');
        e.statusCode = 500;
        throw e;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        const e = new Error('User not found');
        e.statusCode = 401;
        throw e;
      }

      next();
    } catch (error) {
      console.error(`[Auth] Token validation failed: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: `AUTH_TOKEN_FAILED: ${error.message}`,
      });
    }
  }

  if (!token) {
    console.warn(`[Auth] No token found for ${req.url}`);
    return res.status(401).json({ success: false, message: 'AUTH_NO_TOKEN' });
  }
};
