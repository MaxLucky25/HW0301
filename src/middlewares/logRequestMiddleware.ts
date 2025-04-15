import { Request, Response, NextFunction } from "express";
import { requestLogsCollection } from "../db/mongo-db";

export const logRequestMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const url = req.originalUrl || req.url || "unknown";

    try {
        await requestLogsCollection.insertOne({
            ip,
            url,
            date: new Date()
        });
    } catch (e) {
        console.error("Ошибка логирования запроса:", e);
    }

    next();
};
