import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { CreateDoctorSpecialtyDto } from './dto/create-doctor-specialty.dto';
import { UpdateDoctorSpecialtyDto } from './dto/update-doctor-specialty.dto';
import { DoctorSpecialtyService } from './doctor-specialty.service';
import { AddSpecialtyToDoctorDto } from './dto/add-specialty-to-doctor.dto';
import { IdCacheInterceptor } from './interceptors/id-cache.interceptor';
import { CacheTTL } from '@nestjs/cache-manager';

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

  @Post("/add-to-doctor")
  addSpecialtyToDoctor(@Body() addSpecialtyToDoctorDto:AddSpecialtyToDoctorDto){
   return this.doctorSpecialtyService.addSpecialtyToDoctor(addSpecialtyToDoctorDto) 
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
  @Get('/:specialtyId')
  @UseInterceptors(IdCacheInterceptor)
  @CacheTTL(1000*60*60*24)
  get(@Param('specialtyId') specialtyId: string) {
    return this.doctorSpecialtyService.findDoctorSpecialty({id:specialtyId});
  }
}
