import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../utility/config';

export const jwtService = {
    createAccessToken(payload: { userId: string }) {
        return jwt.sign(payload,
            config.JWT_SECRET,
            { expiresIn: config.JWT_EXPIRES_IN }as jwt.SignOptions
        );
    },

    createRefreshToken(payload: {
        userId: string;
        deviceId: string;
        lastActiveDate: string;
    }){
        return jwt.sign(payload,
            config.JWT_REFRESH_SECRET,
            { expiresIn: config.JWT_REFRESH_EXPIRES_IN }as jwt.SignOptions
        );
    },

    verifyAccessToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
        } catch {
            return null;
        }
    },

    verifyRefreshToken(token: string): JwtPayload | null {
        try {
            return jwt.verify(token, config.JWT_REFRESH_SECRET) as JwtPayload;
        } catch {
            return null;
        }
    },


    getRefreshTokenExpiry(token: string): Date | null {
        try {
            const decoded = jwt.decode(token) as JwtPayload;
            if (!decoded?.exp) return null;
            return new Date(decoded.exp * 1000);
        } catch {
            return null;
        }
    }
};
