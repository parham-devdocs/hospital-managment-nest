import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Certification, EducationEntry, WorkExperience } from "../types";
import { Type } from "class-transformer";
import { DoctorEducationDto } from "./doctor-education-dto";
import { DoctorWorkExperienceDto } from "./doctor-work-experience";
import { DoctorCertificationDto } from "./doctor-certification";
import { SpecialtyEntity } from "src/doctor-specialty/entities/doctor-specialty.entity";
import { CreateUserDto } from "src/user/dto/create-user.dto";

export class CreateDoctorDto {



    
    @IsNotEmpty()
    @IsObject()
    specialty:SpecialtyEntity

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(() => DoctorEducationDto) 
    educations:EducationEntry[]

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(() => DoctorWorkExperienceDto) 
    workExperiences:WorkExperience[]

    @IsOptional()
    @IsString()
    bio?:string

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(() => DoctorCertificationDto) 
    certifications:Certification[]

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(() =>CreateUserDto) 
    user:CreateUserDto
    
}
