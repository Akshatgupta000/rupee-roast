import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(`[Auth] Token validation failed: ${error.message}`);
      res.status(401).json({ message: `AUTH_TOKEN_FAILED: ${error.message}` });
    }
  }

  if (!token) {
    console.warn(`[Auth] No token found for ${req.url}`);
    res.status(401).json({ message: 'AUTH_NO_TOKEN' });
  }
};
