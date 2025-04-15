import { Request, Response, NextFunction } from "express";
import { requestLogsCollection } from "../db/mongo-db";

export const requestCountMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip;
    const url = req.originalUrl;
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000);

    try {
        const count = await requestLogsCollection.countDocuments({
            ip,
            url,
            date: { $gte: tenSecondsAgo }
        });

        console.log(`Запросов от ${ip} на ${url} за последние 10 секунд: ${count}`);
    } catch (e) {
        console.error("Ошибка при подсчете запросов:", e);
    }

    next();
};
