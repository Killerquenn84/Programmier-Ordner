import mongoose from 'mongoose';
declare const Patient: mongoose.Model<{
    createdAt: Date;
    firstName: string;
    lastName: string;
    birthDate: Date;
    phoneNumber: string;
    email?: string | undefined;
    address?: {
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
    } | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: Date;
    firstName: string;
    lastName: string;
    birthDate: Date;
    phoneNumber: string;
    email?: string | undefined;
    address?: {
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
    } | undefined;
}> & {
    createdAt: Date;
    firstName: string;
    lastName: string;
    birthDate: Date;
    phoneNumber: string;
    email?: string | undefined;
    address?: {
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
    } | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    createdAt: Date;
    firstName: string;
    lastName: string;
    birthDate: Date;
    phoneNumber: string;
    email?: string | undefined;
    address?: {
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
    } | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: Date;
    firstName: string;
    lastName: string;
    birthDate: Date;
    phoneNumber: string;
    email?: string | undefined;
    address?: {
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
    } | undefined;
}>> & mongoose.FlatRecord<{
    createdAt: Date;
    firstName: string;
    lastName: string;
    birthDate: Date;
    phoneNumber: string;
    email?: string | undefined;
    address?: {
        street: string;
        houseNumber: string;
        postalCode: string;
        city: string;
    } | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
export default Patient;
