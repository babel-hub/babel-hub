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
        message: "Demasiadas solicitudes. Por favor, intenta de nuevo en 15 minutos.",
    },
});

export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
});

// For Later

/*

export const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false
});

export const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        message: "Demasiadas solicitudes. Por favor, intenta de nuevo en 15 minutos.",
    },
});

export const authLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
});

*/
