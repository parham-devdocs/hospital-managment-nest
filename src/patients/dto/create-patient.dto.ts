// patients/dto/create-patient.dto.ts
import { 
    IsString, 
    Matches, 
    MaxLength, 
    IsNotEmpty,
    IsArray,
    ArrayNotEmpty,
    IsEnum,
    IsNumber,
    IsBoolean,
    Min,
    Max,
    IsOptional
} from "class-validator";
import { Type } from "class-transformer";
import { BloodTypes } from "../type";


export class CreatePatientDto {

    @IsString()
    @IsNotEmpty()
    profileId:string

    
    @IsString()
    @IsNotEmpty({ message: 'Illness is required' })
    @MaxLength(255, { message: 'Illness must not exceed 255 characters' })
    illness: string;

    @IsString()
    @IsNotEmpty({ message: 'Medical condition summary is required' })
    @MaxLength(1000, { message: 'Summary must not exceed 1000 characters' })
    medical_condition_summary: string;

    @IsArray({ message: 'Allergies must be an array' })
    @ArrayNotEmpty({ message: 'At least one allergy is required' })
    @IsString({ each: true, message: 'Each allergy must be a string' })
    allergies: string[];

    @IsArray({ message: 'Blood types must be an array' })
    @ArrayNotEmpty({ message: 'At least one blood type is required' })
    @IsEnum(BloodTypes, { 
        each: true,
        message: 'Each blood type must be one of: A+, A-, B+, B-, AB+, AB-, O+, O-'
    })
    bloodTypes: BloodTypes[];

    @IsString()
    @IsNotEmpty({ message: 'Emergency phone number is required' })
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Phone number must be in E.164 format (e.g., +1234567890)'
    })
    emergency_phone: string;

    @IsNumber({}, { message: 'Weight must be a number' })
    @IsNotEmpty({ message: 'Weight is required' })
    @Min(1, { message: 'Weight must be at least 1 kg' })
    @Max(500, { message: 'Weight must not exceed 500 kg' })
    weight: number;

    @IsNumber({}, { message: 'Height must be a number' })
    @IsNotEmpty({ message: 'Height is required' })
    @Min(1, { message: 'Height must be at least 1 cm' })
    @Max(300, { message: 'Height must not exceed 300 cm' })
    height: number;

    @IsBoolean({ message: 'isActive must be a boolean' })
    @IsOptional() 
    isActive?: boolean;
}