import { IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Certification, EducationEntry, Specialty, WorkExperience } from "../types";

export class CreateDoctorDto {


    @IsString()
    @IsNotEmpty()
    userId:string
    
    @IsString()
    @IsNotEmpty()
    specialties:Specialty[]

    @ValidateNested()
    @IsNotEmpty()
    educations:EducationEntry[]

    @ValidateNested()
    @IsNotEmpty()
    workExperiences:WorkExperience[]

    @ValidateNested()
    @IsNotEmpty()
    certifications:Certification[]
    
}
