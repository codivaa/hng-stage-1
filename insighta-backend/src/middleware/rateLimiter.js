import rateLimit, { ipKeyGenerator } from "express-rate-limit";

// Limit GitHub login attempts to reduce abuse of the OAuth endpoint.
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// Limit protected API traffic; prefer user id once protect middleware has decoded it.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false
});
