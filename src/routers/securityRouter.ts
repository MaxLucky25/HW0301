import { Router, Request, Response } from "express";
import { jwtService } from "../services/jwtService";
import { sessionRepository } from "../repositories/sessionRepository";
import {jwtAuthMiddleware} from "../middlewares/jwtAuthMiddleware";
import {refreshTokenMiddleware} from "../middlewares/refreshTokenMiddleware";

export const securityRouter = Router();

securityRouter.get("/devices",
    jwtAuthMiddleware,
    async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const sessions = await sessionRepository.findAllByUser(userId);

    const mapped = sessions.map(s => ({
        ip: s.ip,
        title: s.title,
        lastActiveDate: s.lastActiveDate,
        deviceId: s.deviceId,
    }));

    res.status(200).json(mapped);
});

securityRouter.delete("/devices",
    refreshTokenMiddleware,
    async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken){
        res.sendStatus(401);
        return;
    }

    const payload = jwtService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId || !payload.deviceId) {
        res.sendStatus(401);
        return;
    }


    await sessionRepository.deleteAllExcept(payload.deviceId, payload.userId);
    res.sendStatus(204);
});

securityRouter.delete("/devices/:deviceId",
    refreshTokenMiddleware,
    async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.sendStatus(401);
        return;
    }

    const payload = jwtService.verifyRefreshToken(refreshToken);
    if (!payload || !payload.userId || !payload.deviceId) {
        res.sendStatus(401);
        return;
    }

    const session = await sessionRepository.findByDeviceId(req.params.deviceId);
    if (!session){
        res.sendStatus(404);
        return;
    }
    if (session.userId !== payload.userId) {
         res.sendStatus(403);
        return;
    }

    await sessionRepository.deleteByDeviceId(req.params.deviceId);
    res.sendStatus(204);
});
