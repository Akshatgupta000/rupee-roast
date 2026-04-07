import { rateLimit, ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate limit AI calls: max 5 per minute per user.
 * Applies to AI-generation endpoints (roast, advice, goal roast).
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    // All AI endpoints are JWT-protected; rate limit strictly by user id.
    // Use the official ipKeyGenerator to avoid IPv6 bypass warnings and properly identify IP.
    return req.user?.id ? String(req.user.id) : ipKeyGenerator(req, res);
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many AI requests. Please wait and try again.',
    });
  },
});

