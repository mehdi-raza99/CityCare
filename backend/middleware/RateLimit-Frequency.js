import {createRateLimiter} from "./rateLimit.js";

// Only 1 request allowed in 6 hours
const strictLimiter = createRateLimiter({
  windowMs: 1 * 60 * 60 * 1000,
  max: 1,
  message: "Only 1 request allowed in 1 hour",
});

// 3 requests allowed in 12 hours
const mediumLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: "Max 5 requests allowed per 5 minutes",
});

// 20 requests allowed in 60 minutes
const relaxedLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  max: 30,
  message: "Too many requests in short time",
});

export { strictLimiter, mediumLimiter, relaxedLimiter };