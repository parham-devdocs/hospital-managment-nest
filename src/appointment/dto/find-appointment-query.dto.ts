// dto/appointment-query.dto.ts
import {
    IsOptional,
    IsDateString,
    IsEnum,
    IsUUID,
    IsString,
    IsNumber,
    Min,
    Max,
    ValidateIf,
    IsNotEmpty,
  } from 'class-validator';
  import { Type, Transform } from 'class-transformer';
import { AppointmentStatus } from '../types';
  

  
  export class AppointmentQueryDto {
    @IsNotEmpty({ message: 'from date is required' })
    @IsDateString({}, { message: 'from must be a valid date string (YYYY-MM-DD)' })
    @Transform(({ value }) => {
      // Keep as string for validation, transform to Date after validation
      return value;
    })
    from: string; // ✅ Keep as string for validation
  
    @IsNotEmpty({ message: 'to date is required' })
    @IsDateString({}, { message: 'to must be a valid date string (YYYY-MM-DD)' })
    @Transform(({ value }) => {
      // Keep as string for validation, transform to Date after validation
      return value;
    })
    to: string; // ✅ Keep as string for validation
  
    @IsOptional()
    @IsEnum(AppointmentStatus, {
      message:
        'status must be one of: completed, cancelled, ongoing, pending, confirmed, no-show',
    })
    status?: AppointmentStatus;
  
    @IsOptional()
    @IsUUID('4', { message: 'doctorId must be a valid UUID' })
    doctorId?: string;
  
    @IsOptional()
    @IsUUID('4', { message: 'patientId must be a valid UUID' })
    patientId?: string;
  
    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'page must be at least 1' })
    @Transform(({ value }) => parseInt(value, 10))
    page: number = 1;
  
    @IsOptional()
    @IsNumber()
    @Min(1, { message: 'limit must be at least 1' })
    @Max(100, { message: 'limit cannot exceed 100' })
    limit: number = 10;
  
    @IsOptional()
    @IsString()
    sortBy: string = 'date';
  
    @IsOptional()
    @IsEnum(['ASC', 'DESC'], {
      message: 'order must be either ASC or DESC',
    })
    order?: 'ASC' | 'DESC' = 'ASC';
  
 
  }