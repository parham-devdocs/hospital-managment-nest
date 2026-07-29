// create-appointment.dto.ts
import { IsUUID, IsString } from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  availableTimeId: string;

  @IsString()
  description: string; 
}