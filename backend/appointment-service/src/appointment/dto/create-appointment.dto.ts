import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateAppointmentDto {
  @ApiProperty({ description: 'ID des Patienten' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'ID des Arztes' })
  @IsUUID()
  doctorId: string;

  @ApiProperty({ description: 'Startzeit des Termins' })
  @IsDate()
  startTime: Date;

  @ApiProperty({ description: 'Endzeit des Termins' })
  @IsDate()
  endTime: Date;

  @ApiProperty({ description: 'Notizen zum Termin', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'Ist es ein wiederkehrender Termin?', required: false })
  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @ApiProperty({ description: 'Muster für wiederkehrende Termine', required: false })
  @IsString()
  @IsOptional()
  recurrencePattern?: string;
} 