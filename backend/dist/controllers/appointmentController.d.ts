import { Request, Response } from 'express';
export declare const createAppointment: (req: Request, res: Response) => Promise<void>;
export declare const getPatientAppointments: (req: Request, res: Response) => Promise<void>;
export declare const getDoctorAppointments: (req: Request, res: Response) => Promise<void>;
export declare const confirmAppointment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const rejectAppointment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
