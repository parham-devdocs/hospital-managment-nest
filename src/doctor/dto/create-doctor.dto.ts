import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Certification, EducationEntry, Specialty, WorkExperience } from "../types";
import { Type } from "class-transformer";
import { DoctorEducationDto } from "./doctor-education-dto";
import { DoctorWorkExperienceDto } from "./doctor-work-experience";
import { DoctorCertificationDto } from "./doctor-certification";

export class CreateDoctorDto {


    
    @IsString()
    @IsNotEmpty()
    userId:string
    
    @IsNotEmpty()
    @IsArray()
    specialties:Specialty[]

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(() => DoctorEducationDto) 
    educations:EducationEntry[]

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(() => DoctorWorkExperienceDto) 
    workExperiences:WorkExperience[]

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(() => DoctorCertificationDto) 
    certifications:Certification[]
    
}
