import rateLimit from 'express-rate-limit';
import logger from '../utils/logger.js';

export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // attempts per window per IP
    message: { error: 'Too many login attempts, please try again after 15 minutes' },
    handler: (req, res, _, options) => {
        logger.infoWithMeta('Rate limit exceeded', 'Too many login attempts', {
            ip: req.ip,
            path: req.path,
            attemptCount: req.rateLimit.current,
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining
        });
        res.status(429).json(options.message);
    }
});

export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // attempts per hour per IP
    message: { error: 'Too many registration attempts, please try again after an hour' },
    handler: (req, res, _, options) => {
        logger.infoWithMeta('Rate limit exceeded', 'Too many registration attempts', {
            ip: req.ip,
            path: req.path,
            attemptCount: req.rateLimit.current,
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining
        });
        res.status(429).json(options.message);
    }
});