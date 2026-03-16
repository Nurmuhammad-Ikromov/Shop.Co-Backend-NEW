import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "So'rovlar soni oshib ketdi. 1 daqiqadan so'ng qayta urinib ko'ring." },
});
