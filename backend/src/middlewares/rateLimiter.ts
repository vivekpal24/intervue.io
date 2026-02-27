import { Request, Response, NextFunction } from 'express';

interface RateLimitInfo {
    count: number;
    resetTime: number;
}

export const createRateLimiter = (maxRequests: number, windowMs: number) => {
    const limits = new Map<string, RateLimitInfo>();

    const cleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [ip, info] of limits.entries()) {
            if (now > info.resetTime) {
                limits.delete(ip);
            }
        }
    }, Math.max(windowMs, 10000)); // Clean up at least every 10s or windowMs

    cleanupInterval.unref();

    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            const now = Date.now();

            const info = limits.get(ip);

            if (!info) {
                limits.set(ip, { count: 1, resetTime: now + windowMs });
                return next();
            }

            if (now > info.resetTime) {
                info.count = 1;
                info.resetTime = now + windowMs;
                return next();
            }

            if (info.count >= maxRequests) {
                return res.status(429).json({ error: 'Too many requests, please try again later.' });
            }

            info.count++;
            next();
        } catch (error) {
            console.error('Rate limiter error:', error);
            next();
        }
    };
};
