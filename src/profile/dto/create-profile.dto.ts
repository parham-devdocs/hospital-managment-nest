// dto/create-profile.dto.ts
import { IsString, IsNotEmpty, IsNumber, Min, Max, IsEnum, IsOptional, Matches, MaxLength } from "class-validator";
import { Gender } from "../types";


export class CreateProfileDto {
    @IsString()
    @IsNotEmpty({ message: 'Full name is required' })
    @MaxLength(100)
    fullName: string;

    @IsString()
    @IsNotEmpty({ message: 'Address is required' })
    @MaxLength(255)
    address: string;

    @IsString()
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^\+[1-9]\d{1,14}$/, {
        message: 'Phone number must be in E.164 format (e.g., +1234567890)'
    })
    phoneNumber: string;

    @IsNumber()
    @Min(1, { message: 'Age must be at least 1' })
    @Max(120, { message: 'Age must be at most 120' })
    @IsNotEmpty({ message: 'Age is required' })
    age: number;

    @IsEnum(Gender, { message: 'Gender must be male or female' })
    @IsNotEmpty({ message: 'Gender is required' })
    gender: Gender;
}