import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '../appointment.entity';

export class UpdateAppointmentStatusDto {
  @ApiProperty({
    description: 'Neuer Status des Termins',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED
  })
  @IsEnum(AppointmentStatus)
  status: AppointmentStatus;
} 