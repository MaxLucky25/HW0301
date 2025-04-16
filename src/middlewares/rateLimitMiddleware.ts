import { Request, Response, NextFunction } from 'express';
import {requestLogsCollection} from "../db/mongo-db";

const LIMIT_WINDOW_SECONDS = 10;
const MAX_REQUESTS = 5;

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const url = req.originalUrl;

    const windowStart = new Date(Date.now() - LIMIT_WINDOW_SECONDS * 1000);

    const requestsCount = await requestLogsCollection.countDocuments({
        ip,
        url,
        date: { $gte: windowStart },
    });

    if (requestsCount > MAX_REQUESTS) {
        res.status(429).send('Too many requests');
        return;
    }

    next();
};
