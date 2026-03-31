import rateLimit from 'express-rate-limit';

/**
 * Rate limit AI calls: max 5 per minute per user.
 * Applies to AI-generation endpoints (roast, advice, goal roast).
 */
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // All AI endpoints are JWT-protected; rate limit strictly by user id.
    // Avoid using req.ip to prevent IPv6 bypass warnings from express-rate-limit.
    return req.user?.id ? String(req.user.id) : 'anonymous';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many AI requests. Please wait and try again.',
    });
  },
});

