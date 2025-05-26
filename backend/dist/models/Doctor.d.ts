import mongoose, { Document } from 'mongoose';
export interface IDoctor extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    specialization: string;
    createdAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}
declare const Doctor: mongoose.Model<IDoctor, {}, {}, {}, mongoose.Document<unknown, {}, IDoctor> & IDoctor & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default Doctor;
