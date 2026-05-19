import rateLimit from "express-rate-limit";

export const createRateLimiter = ({
  windowMs,
  max,
  message,
}) => {
  return rateLimit({
    windowMs,
    max,
    keyGenerator: (req) => {
      return req.ip + "_" + req.path; // 🔥 key includes route
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      status: 429,
      message,
      success: false,
    },
  });
};