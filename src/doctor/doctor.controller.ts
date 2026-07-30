import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { FindDoctorQueryDto } from './dto/find-doctors-query';

@Controller('doctor')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Post()
  create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Get()
  findAll( @Query(ValidationPipe) findDoctorsQueries: FindDoctorQueryDto ) {
    const pageNum = findDoctorsQueries.page || 1;  
    const limitNum = findDoctorsQueries.limit || 10;
    return this.doctorService.findAll(pageNum,limitNum,findDoctorsQueries.specialties,findDoctorsQueries.fullName,findDoctorsQueries.isActive);
  }

  @Get(":id")
  findOne(@Param("id") id:string) {

    return this.doctorService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.doctorService.remove(id);
  }
}
