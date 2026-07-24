import {
  IsDateString,
  IsNotEmpty,
  IsString,
} from 'class-validator';


export class DoctorWorkExperienceDto {
  @IsNotEmpty()
  @IsString()
  hospital: string;

  @IsNotEmpty()
  @IsDateString()
  startDate: Date

  @IsNotEmpty()
  @IsDateString()
  endDate: Date

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsString()
  position: string;

  @IsNotEmpty()
  @IsString()
  responsibilities: string[];
}
