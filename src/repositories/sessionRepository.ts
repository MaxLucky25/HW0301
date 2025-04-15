import { sessionsCollection } from "../db/mongo-db";
import { SessionDBType } from "../models/sessionModel";

export const sessionRepository = {
    async createSession(session: SessionDBType) {
        await sessionsCollection.insertOne(session);
    },

        async updateLastActiveDate(
            deviceId: string,
            lastActiveDate: string,
            expiresDate: string,
            ip: string,
            title: string
        ) {
            const result = await sessionsCollection.updateOne(
                { deviceId },
                { $set: { lastActiveDate, expiresDate, ip, title } }
            );
        return result.modifiedCount === 1;
    },

    async deleteByDeviceId(deviceId: string) {
        return sessionsCollection.deleteOne({ deviceId });
    },

    async deleteAllExcept(deviceId: string, userId: string) {
        return sessionsCollection.deleteMany({ deviceId: { $ne: deviceId }, userId });
    },

    async findAllByUser(userId: string) {
        return sessionsCollection.find({ userId }).toArray();
    },

    async findByDeviceId(deviceId: string) {
        return sessionsCollection.findOne({ deviceId });
    }
};
