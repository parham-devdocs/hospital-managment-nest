import { IsDate, IsDateString, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateAvailableTimeDto {

    @IsNotEmpty()
    @IsDateString()
    date:Date

    @IsNotEmpty()
    @IsString()
    time:string


}
