import { Type } from "class-transformer";
import { 
    IsEmail, 
    IsString, 
    Matches, 
    MaxLength, 
    MinLength,
    IsNotEmpty,
    IsNumber,
    Min,
    Max,
    IsEnum
  } from "class-validator";
import { Gender } from "../types";
import { Optional } from "@nestjs/common";
  export class  RegisterAuthDto {
      @IsEmail({}, { message: 'Please provide a valid email address' })
      @IsNotEmpty({ message: 'Email is required' })
      @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
          message: 'Invalid email format'
      })
      email: string;
  
      @IsString()
      @IsNotEmpty({ message: 'Password is required' })
      @MaxLength(256, { message: 'Password is too long' })
      @MinLength(8, { message: 'Password must be at least 8 characters' })
      password: string;


    

    @IsString()
    @IsNotEmpty({ message: 'Full name is required' })
    @MaxLength(100)
    fullName: string;

    @IsString()
    @IsNotEmpty({ message: 'Address is required' })
    @MaxLength(255)
    address: string;
    
    @IsString()
    @Optional()
    avatar_url:string


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

  