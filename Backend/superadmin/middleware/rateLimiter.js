/**
 * Simple in-memory rate limiter
 * For production, use redis-based rate limiter (e.g., rate-limiter-flexible)
 * This implementation limits by IP address
 */

const rateLimitStore = new Map();

/**
 * Create a rate limiter middleware
 * @param {number} maxRequests - max allowed requests
 * @param {number} windowMs - time window in milliseconds
 * @param {string} message - error message when limit exceeded
 */
const createRateLimiter = (maxRequests, windowMs, message) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const key = `${ip}:${req.path}`;
    const now = Date.now();

    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, { count: 1, startTime: now });
      return next();
    }

    const record = rateLimitStore.get(key);

    // Reset window if expired
    if (now - record.startTime > windowMs) {
      rateLimitStore.set(key, { count: 1, startTime: now });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfter = Math.ceil((record.startTime + windowMs - now) / 1000);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        success: false,
        message,
        retryAfter: `${retryAfter} seconds`,
      });
    }

    record.count += 1;
    next();
  };
};

// 5 login attempts per 15 minutes
const loginRateLimiter = createRateLimiter(
  5,
  15 * 60 * 1000,
  "Too many login attempts. Please try again in 15 minutes."
);

// 3 forgot-password requests per 10 minutes
const forgotPasswordRateLimiter = createRateLimiter(
  3,
  10 * 60 * 1000,
  "Too many password reset requests. Please try again in 10 minutes."
);

module.exports = { loginRateLimiter, forgotPasswordRateLimiter };
