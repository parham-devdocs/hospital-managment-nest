import {  IsDateString, IsNotEmpty, IsString } from "class-validator";


 
export class DoctorCertificationDto {

    
    @IsNotEmpty()
    @IsString()
    name:string

    @IsNotEmpty()
    @IsString()
    issuingOrganization:string

    @IsNotEmpty()
    @IsDateString()
    dateObtained:Date

    @IsNotEmpty()
    @IsDateString()
    expiryDate:Date

    @IsNotEmpty()
    @IsString()
    certificationNumber: string[]



    
}
