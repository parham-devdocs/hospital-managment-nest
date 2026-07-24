import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { Certification, EducationEntry, Specialty, WorkExperience } from "../types";
import { Type } from "class-transformer";

export class DoctorEducationDto {

    
    @IsNotEmpty()
    @IsString()
    medicalSchool:string

    @IsNotEmpty()
    @IsNumber()
    graduationYear:number

    @IsNotEmpty()
    @IsNumber()
    country:string

    @IsNotEmpty()
    @IsString()
    degree:string

    @IsNotEmpty()
    @IsArray()
    honors:string[]



    
}
