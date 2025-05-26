import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { User } from '../user/user.entity';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private redisService: RedisService,
  ) {}

  async createAppointment(
    patientId: string,
    doctorId: string,
    startTime: Date,
    endTime: Date,
    notes?: string,
    isRecurring?: boolean,
    recurrencePattern?: string,
  ): Promise<Appointment> {
    // Überprüfe Verfügbarkeit
    const isAvailable = await this.checkAvailability(doctorId, startTime, endTime);
    if (!isAvailable) {
      throw new BadRequestException('Der gewählte Zeitraum ist nicht verfügbar');
    }

    const patient = await this.userRepository.findOne({ where: { id: patientId } });
    const doctor = await this.userRepository.findOne({ where: { id: doctorId } });

    if (!patient || !doctor) {
      throw new NotFoundException('Patient oder Arzt nicht gefunden');
    }

    const appointment = this.appointmentRepository.create({
      patient,
      doctor,
      startTime,
      endTime,
      notes,
      isRecurring,
      recurrencePattern,
      status: AppointmentStatus.SCHEDULED,
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);
    
    // Cache für schnelle Verfügbarkeitsabfragen aktualisieren
    await this.updateAvailabilityCache(doctorId, startTime, endTime);

    return savedAppointment;
  }

  async getAppointments(
    userId: string,
    startDate: Date,
    endDate: Date,
    role: string,
  ): Promise<Appointment[]> {
    const query = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.doctor', 'doctor')
      .where('appointment.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (role === 'doctor') {
      query.andWhere('doctor.id = :userId', { userId });
    } else if (role === 'patient') {
      query.andWhere('patient.id = :userId', { userId });
    }

    return query.getMany();
  }

  async updateAppointmentStatus(
    appointmentId: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Termin nicht gefunden');
    }

    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }

  async cancelAppointment(appointmentId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Termin nicht gefunden');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    const cancelledAppointment = await this.appointmentRepository.save(appointment);

    // Cache für Verfügbarkeit aktualisieren
    await this.updateAvailabilityCache(
      appointment.doctor.id,
      appointment.startTime,
      appointment.endTime,
    );

    return cancelledAppointment;
  }

  private async checkAvailability(
    doctorId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<boolean> {
    // Zuerst im Cache nachsehen
    const cacheKey = `availability:${doctorId}:${startTime.toISOString()}`;
    const cachedAvailability = await this.redisService.get(cacheKey);
    
    if (cachedAvailability !== null) {
      return cachedAvailability === 'true';
    }

    // Wenn nicht im Cache, in der Datenbank prüfen
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: doctorId },
        startTime: Between(startTime, endTime),
        status: AppointmentStatus.SCHEDULED,
      },
    });

    const isAvailable = !existingAppointment;
    
    // Cache für 1 Stunde speichern
    await this.redisService.set(cacheKey, isAvailable.toString(), 3600);

    return isAvailable;
  }

  private async updateAvailabilityCache(
    doctorId: string,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const cacheKey = `availability:${doctorId}:${startTime.toISOString()}`;
    await this.redisService.del(cacheKey);
  }
} 