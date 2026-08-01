// create-appointment.dto.ts
import { IsUUID, IsString, IsEnum, IsOptional } from 'class-validator';
import { AppointmentStatus } from '../types';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  availableTimeId: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(AppointmentStatus)
  appointmentStatus: AppointmentStatus = AppointmentStatus.PENDING; // ✅ Default value
}