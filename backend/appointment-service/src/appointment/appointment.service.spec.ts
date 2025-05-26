import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { User, UserRole } from '../user/user.entity';
import { RedisService } from '../redis/redis.service';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let appointmentRepository: Repository<Appointment>;
  let userRepository: Repository<User>;
  let redisService: RedisService;

  const mockAppointment = {
    id: '1',
    startTime: new Date(),
    endTime: new Date(),
    status: AppointmentStatus.SCHEDULED,
    patient: { id: '1', role: UserRole.PATIENT },
    doctor: { id: '2', role: UserRole.DOCTOR },
  };

  const mockUser = {
    id: '1',
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max@example.com',
    role: UserRole.PATIENT,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: getRepositoryToken(Appointment),
          useValue: {
            create: jest.fn().mockReturnValue(mockAppointment),
            save: jest.fn().mockResolvedValue(mockAppointment),
            findOne: jest.fn().mockResolvedValue(mockAppointment),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockAppointment]),
            })),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn().mockResolvedValue('true'),
            set: jest.fn().mockResolvedValue(undefined),
            del: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    appointmentRepository = module.get<Repository<Appointment>>(
      getRepositoryToken(Appointment),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    redisService = module.get<RedisService>(RedisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAppointment', () => {
    it('should create a new appointment', async () => {
      const result = await service.createAppointment(
        '1',
        '2',
        new Date(),
        new Date(),
      );

      expect(result).toEqual(mockAppointment);
      expect(appointmentRepository.create).toHaveBeenCalled();
      expect(appointmentRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException when time slot is not available', async () => {
      jest.spyOn(redisService, 'get').mockResolvedValueOnce('false');

      await expect(
        service.createAppointment('1', '2', new Date(), new Date()),
      ).rejects.toThrow('Der gewählte Zeitraum ist nicht verfügbar');
    });
  });

  describe('getAppointments', () => {
    it('should return appointments for a patient', async () => {
      const result = await service.getAppointments(
        '1',
        new Date(),
        new Date(),
        'patient',
      );

      expect(result).toEqual([mockAppointment]);
      expect(appointmentRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should return appointments for a doctor', async () => {
      const result = await service.getAppointments(
        '2',
        new Date(),
        new Date(),
        'doctor',
      );

      expect(result).toEqual([mockAppointment]);
      expect(appointmentRepository.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe('updateAppointmentStatus', () => {
    it('should update appointment status', async () => {
      const result = await service.updateAppointmentStatus(
        '1',
        AppointmentStatus.CONFIRMED,
      );

      expect(result).toEqual(mockAppointment);
      expect(appointmentRepository.findOne).toHaveBeenCalled();
      expect(appointmentRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when appointment not found', async () => {
      jest.spyOn(appointmentRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(
        service.updateAppointmentStatus('1', AppointmentStatus.CONFIRMED),
      ).rejects.toThrow('Termin nicht gefunden');
    });
  });

  describe('cancelAppointment', () => {
    it('should cancel an appointment', async () => {
      const result = await service.cancelAppointment('1');

      expect(result).toEqual(mockAppointment);
      expect(appointmentRepository.findOne).toHaveBeenCalled();
      expect(appointmentRepository.save).toHaveBeenCalled();
      expect(redisService.del).toHaveBeenCalled();
    });

    it('should throw NotFoundException when appointment not found', async () => {
      jest.spyOn(appointmentRepository, 'findOne').mockResolvedValueOnce(null);

      await expect(service.cancelAppointment('1')).rejects.toThrow(
        'Termin nicht gefunden',
      );
    });
  });
}); 