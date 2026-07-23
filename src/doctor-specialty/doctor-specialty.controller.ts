import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DoctorSpecialtyService } from './doctor-specialty.service';
import { CreateDoctorSpecialtyDto } from './dto/create-doctor-specialty.dto';
import { UpdateDoctorSpecialtyDto } from './dto/update-doctor-specialty.dto';

@Controller('doctor-specialty')
export class DoctorSpecialtyController {
  constructor(private readonly doctorSpecialtyService: DoctorSpecialtyService) {}

  @Post()
  create(@Body() createDoctorSpecialtyDto: CreateDoctorSpecialtyDto) {
    return this.doctorSpecialtyService.create(createDoctorSpecialtyDto);
  }

  @Get()
  findAll() {
    return this.doctorSpecialtyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.doctorSpecialtyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorSpecialtyDto: UpdateDoctorSpecialtyDto) {
    return this.doctorSpecialtyService.update(+id, updateDoctorSpecialtyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorSpecialtyService.remove(+id);
  }
}
