import { 
    IsEmail, 
    IsString, 
    Matches, 
    MaxLength, 
    MinLength,
    IsNotEmpty
  } from "class-validator";
  import { Transform, Type } from "class-transformer";
  import * as bcrypt from 'bcrypt'
  export class SignUpAuthDto {
      @IsEmail({}, { message: 'Please provide a valid email address' })
      @IsNotEmpty({ message: 'Email is required' })
      @MaxLength(1024, { message: 'Email is too long' })
      @Matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/, {
          message: 'Invalid email format'
      })
      email: string;
  
      @IsString()
      @IsNotEmpty({ message: 'Password is required' })
      @MinLength(8, { message: 'Password must be at least 8 characters' })
      @MaxLength(256, { message: 'Password is too long' })
   
      password: string;


  }