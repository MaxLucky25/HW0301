import { Request, Response, NextFunction } from 'express';
import {requestLogsCollection} from '../db/mongo-db';

export const logRequestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logEntry = {
            ip: req.ip || '',
            url: req.originalUrl,
            date: new Date(),
        };

        await requestLogsCollection.insertOne(logEntry);
    } catch (err) {
        console.error('Logging error:', err);
    }
    next();
};
