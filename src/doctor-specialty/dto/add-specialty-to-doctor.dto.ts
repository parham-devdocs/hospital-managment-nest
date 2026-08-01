import { IsArray, IsString, IsUUID } from "class-validator";

export class AddSpecialtyToDoctorDto {

  @IsString()
    // @IsUUID()
    doctorId: string;
  
    @IsString()
    // @IsUUID()
    specialtyId: string;
  }