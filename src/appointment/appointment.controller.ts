import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { StringToDatePipe } from 'src/pipes/stringToDate.pipe';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get('/doctor/:doctorId')
  findAppointmentsOfDoctor(@Param('doctorId') doctorId: string, @Query("from",StringToDatePipe) from:Date , @Query("to",StringToDatePipe) to:Date ) {
    return this.appointmentService.findAppointmentsOfDoctor(doctorId,from,to);
  }
  @Get()
  findAllAppointments( @Query("from",StringToDatePipe) from:Date , @Query("to",StringToDatePipe) to:Date ) {
    return this.appointmentService.findAllAppointments(from,to);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: UpdateAppointmentDto) {
    return this.appointmentService.update(+id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}
