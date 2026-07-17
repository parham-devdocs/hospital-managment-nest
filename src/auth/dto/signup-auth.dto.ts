// dto/create-auth.dto.ts
import { 
    IsEmail, 
    IsEnum, 
    IsString, 
    Matches, 
    MaxLength, 
    MinLength,
    IsOptional,
    IsNotEmpty
  } from "class-validator";
  import { Transform } from "class-transformer";
  
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
      // ✅ Changed from hashedPassword to password
      password: string;


  }