import { Request, Response } from 'express';
export declare const registerDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const loginDoctor: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
