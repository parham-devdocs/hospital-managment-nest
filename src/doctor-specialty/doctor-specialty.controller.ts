import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { CreateDoctorSpecialtyDto } from './dto/create-doctor-specialty.dto';
import { UpdateDoctorSpecialtyDto } from './dto/update-doctor-specialty.dto';
import { DoctorSpecialtyService } from './doctor-specialty.service';

@Controller('doctor-specialty')
export class DoctorSpecialtyController {
  constructor(
    private readonly doctorSpecialtyService: DoctorSpecialtyService,
  ) {}

  @Post()
  create(@Body() createDoctorSpecialtyDto: CreateDoctorSpecialtyDto) {
    return this.doctorSpecialtyService.createDoctorSpecialty(
      createDoctorSpecialtyDto,
    );
  }

  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.doctorSpecialtyService.removeDoctorSpecialty(id);
  }
  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body() updateDoctorSpecialtyDto: UpdateDoctorSpecialtyDto,
  ) {
    return this.doctorSpecialtyService.updateDoctorSpecialty(
      id,
      updateDoctorSpecialtyDto,
    );
  }
  @Get('/:id')
  get(@Param('id') id: string) {
    return this.doctorSpecialtyService.findDoctorSpecialty(id);
  }
}
