import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60
});