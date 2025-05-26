import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            doctor?: any;
        }
    }
}
export declare const auth: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateToken: (doctorId: string) => string;
