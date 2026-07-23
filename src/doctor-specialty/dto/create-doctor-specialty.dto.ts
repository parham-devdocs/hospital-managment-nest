import { IsNotEmpty, IsString } from "class-validator";

export class CreateDoctorSpecialtyDto {

    @IsString()
    @IsNotEmpty()
    name:string

}
