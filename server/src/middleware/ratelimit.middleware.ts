import rateLimit from "express-rate-limit";

export const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false
})

export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: {
        message: "Too many requests. Please slow down.",
    },
});

export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 50,
});