import mongoose from 'mongoose';
declare const Appointment: mongoose.Model<{
    patientName: string;
    patientGeburtsdatum: string;
    arztId: string;
    datum: string;
    uhrzeit: string;
    status: "angefragt" | "bestätigt" | "abgelehnt" | "abgesagt";
    createdAt: Date;
    kommentar?: string | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    patientName: string;
    patientGeburtsdatum: string;
    arztId: string;
    datum: string;
    uhrzeit: string;
    status: "angefragt" | "bestätigt" | "abgelehnt" | "abgesagt";
    createdAt: Date;
    kommentar?: string | undefined;
}> & {
    patientName: string;
    patientGeburtsdatum: string;
    arztId: string;
    datum: string;
    uhrzeit: string;
    status: "angefragt" | "bestätigt" | "abgelehnt" | "abgesagt";
    createdAt: Date;
    kommentar?: string | undefined;
} & {
    _id: mongoose.Types.ObjectId;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, mongoose.DefaultSchemaOptions, {
    patientName: string;
    patientGeburtsdatum: string;
    arztId: string;
    datum: string;
    uhrzeit: string;
    status: "angefragt" | "bestätigt" | "abgelehnt" | "abgesagt";
    createdAt: Date;
    kommentar?: string | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    patientName: string;
    patientGeburtsdatum: string;
    arztId: string;
    datum: string;
    uhrzeit: string;
    status: "angefragt" | "bestätigt" | "abgelehnt" | "abgesagt";
    createdAt: Date;
    kommentar?: string | undefined;
}>> & mongoose.FlatRecord<{
    patientName: string;
    patientGeburtsdatum: string;
    arztId: string;
    datum: string;
    uhrzeit: string;
    status: "angefragt" | "bestätigt" | "abgelehnt" | "abgesagt";
    createdAt: Date;
    kommentar?: string | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
}>>;
export default Appointment;
