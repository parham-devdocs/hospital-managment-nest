import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseInterceptors,
} from '@nestjs/common';
import { AvailableTimeService } from './services/available_time.service';
import { CreateAvailableTimeDto } from './dto/create-available_time.dto';
import { UpdateAvailableTimeDto } from './dto/update-available_time.dto';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@UseInterceptors(CacheInterceptor) 
@Controller('available-time')
export class AvailableTimeController {
  constructor(private readonly availableTimeService: AvailableTimeService) {}

  @Post(':doctorId')
  create(
    @Body() createAvailableTimeDto: CreateAvailableTimeDto,
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
  ) {
    return this.availableTimeService.create(createAvailableTimeDto, doctorId);
  }

  @Get(':doctorId')
  @CacheKey('available-times') 
  @CacheTTL(10000) 
  findAllAvailableTimesOfDoctor(
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
  ) {
    return this.availableTimeService.findAllAvailableTimesOfDoctor(doctorId);
  }

  @Patch(':doctorId')
  update(
    @Param('doctorId') doctorId: string,
    @Body() updateAvailableTimeDto: UpdateAvailableTimeDto,
  ) {
    return this.availableTimeService.update(updateAvailableTimeDto, doctorId);
  }

  @Delete(':doctorId')
  remove(@Param('doctorId') doctorId: string) {
    return this.availableTimeService.remove(doctorId);
  }
}