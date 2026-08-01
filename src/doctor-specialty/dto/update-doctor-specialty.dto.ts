import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorSpecialtyDto } from './create-doctor-specialty.dto';

export class UpdateDoctorSpecialtyDto extends PartialType(CreateDoctorSpecialtyDto) {}
