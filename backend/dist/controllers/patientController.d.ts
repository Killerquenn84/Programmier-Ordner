import { Request, Response } from 'express';
export declare const identifyPatient: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPatientData: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
