import { Request, Response, NextFunction } from 'express';
import {requestLogsCollection} from "../db/mongo-db";
import config from "../utility/config";


export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const url = req.originalUrl;

    const windowStart = new Date(Date.now() - config.LIMIT_WINDOW_SECONDS * 1000);

    const requestsCount = await requestLogsCollection.countDocuments({
        ip,
        url,
        date: { $gte: windowStart },
    });

    if (requestsCount > config.MAX_REQUESTS) {
        res.status(429).send('Too many requests');
        return;
    }

    next();
};
