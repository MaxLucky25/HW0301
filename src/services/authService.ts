import { randomUUID } from "crypto";
import { add } from "date-fns";
import { bcryptService } from "./bcryptService";
import { userRepository } from "../repositories/userRepository";
import { emailService } from "./emailService";
import { revokedTokenRepository } from '../repositories/revokedTokenRepository';
import {UserDBType} from "../models/userModel";
import {jwtService} from "./jwtService";
import {sessionRepository} from "../repositories/sessionRepository";


export const authService = {
    async login(loginOrEmail: string, password: string,  ip: string, title: string):
        Promise<{ accessToken: string, refreshToken: string } | null> {

        const user = await userRepository.getByLoginOrEmail(loginOrEmail);
        if (!user || !user.emailConfirmation.isConfirmed) return null;

        const isValid = await bcryptService.compareHash(password, user.password);
        if (!isValid) return null;


        const deviceId = randomUUID();
        const lastActiveDate = new Date().toISOString();
        const expiresDate = add(new Date(), { days: 7 }).toISOString(); // или согласно config

        const payload = { userId: user.id, deviceId, lastActiveDate };

        await sessionRepository.createSession({
            userId: user.id,
            deviceId,
            ip,
            title,
            lastActiveDate,
            expiresDate
        });
        return {
            accessToken: jwtService.createAccessToken({ userId: user.id.toString() }),
            refreshToken: jwtService.createRefreshToken(payload),
        };
    },

    async refreshTokens(refreshToken: string, ip: string, title: string) {
        const isRevoked = await revokedTokenRepository.isRevoked(refreshToken);
        if (isRevoked) return null;

        const payload = jwtService.verifyRefreshToken(refreshToken);
        if (!payload || !payload.userId || !payload.deviceId || !payload.lastActiveDate) return null;

        const session = await sessionRepository.findByDeviceId(payload.deviceId);
        if (!session || session.lastActiveDate !== payload.lastActiveDate) return null;

        const newLastActiveDate = new Date().toISOString();
        const newExpiresDate = add(new Date(), { days: 7 }).toISOString();

        await sessionRepository.updateLastActiveDate(
            payload.deviceId,
            newLastActiveDate,
            newExpiresDate,
            ip,
            title
        );
        await this.revokeRefreshToken(refreshToken);

        const newPayload = {
            userId: payload.userId,
            deviceId: payload.deviceId,
            lastActiveDate: newLastActiveDate
        };

        return {
            accessToken: jwtService.createAccessToken({ userId: payload.userId }),
            refreshToken: jwtService.createRefreshToken(newPayload)
        };
    },

    async revokeRefreshToken(refreshToken: string): Promise<void> {
        const expiresAt = jwtService.getRefreshTokenExpiry(refreshToken);
        if (expiresAt) {
            await revokedTokenRepository.add(refreshToken, expiresAt);
        }
    },

    async register(login: string, password: string, email: string) {
        if (await userRepository.doesExistByLoginOrEmail(login, email)) {
            return null;
        }

        const user: UserDBType = {
            id: Date.now().toString(),
            login,
            email,
            password: await bcryptService.generateHash(password),
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: randomUUID(),
                expirationDate: add(new Date(), { hours: 1 }),
                isConfirmed: false
            }
        };

        await userRepository.insert(user);
        await emailService.sendRegistrationEmail(email, user.emailConfirmation.confirmationCode);

        return {
            userId: user.id,
            confirmationCode: user.emailConfirmation.confirmationCode
        };
    },

    async confirm(code: string): Promise<boolean> {
        const user = await userRepository.findByConfirmationCode(code);
        if (!user || user.emailConfirmation.isConfirmed || user.emailConfirmation.expirationDate < new Date()) {
            return false;
        }

        return await userRepository.updateConfirmation(user.id, { isConfirmed: true });
    },

    async resendEmail(email: string): Promise<string | null> {
        const user = await userRepository.getByEmail(email);
        if (!user || user.emailConfirmation.isConfirmed) return null;

        const newConfirmation = generateConfirmation();
        const updated = await userRepository.updateConfirmation(user.id, newConfirmation);
        if (!updated) return null;

        const sent = await emailService.sendRegistrationEmail(email, newConfirmation.confirmationCode);
        return sent ? newConfirmation.confirmationCode : null;
    }
};

function generateConfirmation() {
    return {
        confirmationCode: randomUUID(),
        expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
        isConfirmed: false,
    };
}

