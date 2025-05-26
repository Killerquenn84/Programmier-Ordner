import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { Appointment, AppointmentStatus } from './appointment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../user/user.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentStatusDto } from './dto/update-appointment-status.dto';

@ApiTags('appointments')
@ApiBearerAuth()
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Neuen Termin erstellen' })
  @ApiResponse({ status: 201, description: 'Termin erfolgreich erstellt', type: Appointment })
  @ApiResponse({ status: 400, description: 'Ungültige Anfrage' })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Patient oder Arzt nicht gefunden' })
  async createAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentService.createAppointment(
      createAppointmentDto.patientId,
      createAppointmentDto.doctorId,
      createAppointmentDto.startTime,
      createAppointmentDto.endTime,
      createAppointmentDto.notes,
      createAppointmentDto.isRecurring,
      createAppointmentDto.recurrencePattern,
    );
  }

  @Get()
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Termine abrufen' })
  @ApiResponse({ status: 200, description: 'Liste der Termine', type: [Appointment] })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  async getAppointments(
    @Query('userId') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('role') role: string,
  ): Promise<Appointment[]> {
    return this.appointmentService.getAppointments(
      userId,
      new Date(startDate),
      new Date(endDate),
      role,
    );
  }

  @Put(':id/status')
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Terminstatus aktualisieren' })
  @ApiResponse({ status: 200, description: 'Status erfolgreich aktualisiert', type: Appointment })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Termin nicht gefunden' })
  async updateAppointmentStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateAppointmentStatusDto,
  ): Promise<Appointment> {
    return this.appointmentService.updateAppointmentStatus(id, updateStatusDto.status);
  }

  @Delete(':id')
  @Roles(UserRole.PATIENT, UserRole.DOCTOR)
  @ApiOperation({ summary: 'Termin stornieren' })
  @ApiResponse({ status: 200, description: 'Termin erfolgreich storniert', type: Appointment })
  @ApiResponse({ status: 401, description: 'Nicht autorisiert' })
  @ApiResponse({ status: 404, description: 'Termin nicht gefunden' })
  async cancelAppointment(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentService.cancelAppointment(id);
  }
} 