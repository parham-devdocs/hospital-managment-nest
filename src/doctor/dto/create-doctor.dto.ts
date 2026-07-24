import { IsArray, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { Certification, EducationEntry, Specialty, WorkExperience } from "../types";
import { Type } from "class-transformer";

export class CreateDoctorDto {


    
    @IsString()
    @IsNotEmpty()
    userId:string
    
    @IsNotEmpty()
    @IsArray()
    specialties:Specialty[]

    @IsNotEmpty()
    @ValidateNested({each:true})
    @Type(() => SpecialtyDto) 
    educations:EducationEntry[]

    @IsNotEmpty()
    @ValidateNested()
    workExperiences:WorkExperience[]

    @IsNotEmpty()
    @ValidateNested()
    certifications:Certification[]
    
}
