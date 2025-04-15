export interface UserPayload {
    id: string;
    login: string;
    email: string;
}
// добавили новые значения и свойства в глобальную области видимости
declare global {
    namespace Express {
        export interface Request {
            userId: string | null;
            userLogin?: string;
            userEmail?: string;
            refreshToken?: string;
            user?: UserPayload;
        }
    }
}
export {};