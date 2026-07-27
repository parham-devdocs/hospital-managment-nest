import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AvailableTimeService } from './services/available_time.service';
import { CreateAvailableTimeDto } from './dto/create-available_time.dto';
import { UpdateAvailableTimeDto } from './dto/update-available_time.dto';

@Controller('available-time')
export class AvailableTimeController {
  constructor(private readonly availableTimeService: AvailableTimeService) {}

  @Post(":doctorId")
  create(
    @Body() createAvailableTimeDto: CreateAvailableTimeDto,
    @Param('doctorId', ParseUUIDPipe) doctorId: string,
  ) {
    return this.availableTimeService.create(createAvailableTimeDto, doctorId);
  }

  @Get()
  findAll() {
    return this.availableTimeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.availableTimeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAvailableTimeDto: UpdateAvailableTimeDto,
  ) {
    return this.availableTimeService.update(+id, updateAvailableTimeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.availableTimeService.remove(+id);
  }
}
