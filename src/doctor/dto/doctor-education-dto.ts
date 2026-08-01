import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";


export class DoctorEducationDto {

    
    @IsNotEmpty()
    @IsString()
    medicalSchool:string

    @IsNotEmpty()
    @IsNumber()
    graduationYear:number

    @IsNotEmpty()
    @IsString()
    country:string

    @IsNotEmpty()
    @IsString()
    degree:string

    @IsNotEmpty()
    @IsArray()
    honors:string[]



    
}
