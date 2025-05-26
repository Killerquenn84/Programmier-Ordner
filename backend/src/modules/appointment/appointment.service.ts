import Appointment, { IAppointment } from './appointment.model';
import { Types } from 'mongoose';

export interface CreateAppointmentDto {
  date: Date;
  time: string;
  duration?: number;
  doctorId: string;
  patientId: string;
  description: string;
  notes?: string;
}

export interface UpdateAppointmentDto {
  date?: Date;
  time?: string;
  duration?: number;
  status?: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  description?: string;
  notes?: string;
}

export class AppointmentService {
  // Termin erstellen
  async createAppointment(appointmentData: CreateAppointmentDto): Promise<IAppointment> {
    const appointment = new Appointment({
      ...appointmentData,
      doctorId: new Types.ObjectId(appointmentData.doctorId),
      patientId: new Types.ObjectId(appointmentData.patientId)
    });
    return appointment.save();
  }

  // Termin nach ID finden
  async findById(id: string): Promise<IAppointment | null> {
    return Appointment.findById(id)
      .populate('doctorId')
      .populate('patientId');
  }

  // Termine nach Arzt finden
  async findByDoctorId(doctorId: string): Promise<IAppointment[]> {
    return Appointment.find({ doctorId: new Types.ObjectId(doctorId) })
      .populate('doctorId')
      .populate('patientId');
  }

  // Termine nach Patient finden
  async findByPatientId(patientId: string): Promise<IAppointment[]> {
    return Appointment.find({ patientId: new Types.ObjectId(patientId) })
      .populate('doctorId')
      .populate('patientId');
  }

  // Termine nach Datum filtern
  async findByDate(date: Date): Promise<IAppointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .populate('doctorId')
      .populate('patientId');
  }

  // Termine nach Status filtern
  async findByStatus(status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'): Promise<IAppointment[]> {
    return Appointment.find({ status })
      .populate('doctorId')
      .populate('patientId');
  }

  // Termine nach Datum und Arzt filtern
  async findByDateAndDoctor(date: Date, doctorId: string): Promise<IAppointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      doctorId: new Types.ObjectId(doctorId)
    })
      .populate('doctorId')
      .populate('patientId');
  }

  // Termine nach Datum und Patient filtern
  async findByDateAndPatient(date: Date, patientId: string): Promise<IAppointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return Appointment.find({
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      patientId: new Types.ObjectId(patientId)
    })
      .populate('doctorId')
      .populate('patientId');
  }

  // Termin aktualisieren
  async updateAppointment(id: string, appointmentData: UpdateAppointmentDto): Promise<IAppointment | null> {
    return Appointment.findByIdAndUpdate(
      id,
      appointmentData,
      { new: true }
    )
      .populate('doctorId')
      .populate('patientId');
  }

  // Terminstatus aktualisieren
  async updateStatus(id: string, status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'): Promise<IAppointment | null> {
    return Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    )
      .populate('doctorId')
      .populate('patientId');
  }

  // Termin löschen
  async deleteAppointment(id: string): Promise<IAppointment | null> {
    return Appointment.findByIdAndDelete(id);
  }

  // Verfügbarkeit prüfen
  async checkAvailability(doctorId: string, date: Date, time: string, duration: number): Promise<boolean> {
    const startTime = new Date(`${date.toISOString().split('T')[0]}T${time}`);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const conflictingAppointments = await Appointment.find({
      doctorId: new Types.ObjectId(doctorId),
      date: date,
      $or: [
        {
          $and: [
            { time: { $lte: time } },
            { $expr: { $gte: [{ $add: [{ $toDate: { $concat: [{ $toString: '$date' }, 'T', '$time' } } }, { $multiply: ['$duration', 60000] }] }, startTime] } }
          ]
        },
        {
          $and: [
            { time: { $gte: time } },
            { $expr: { $lte: [{ $toDate: { $concat: [{ $toString: '$date' }, 'T', '$time' } } }, endTime] } }
          ]
        }
      ]
    });

    return conflictingAppointments.length === 0;
  }
}

export default new AppointmentService(); 