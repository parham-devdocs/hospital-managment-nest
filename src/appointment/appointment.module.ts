import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PatientEntity } from 'src/patients/entities/patient.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpecialtyEntity } from 'src/doctor-specialty/entities/doctor-specialty.entity';
import { AppointmentEntity } from './entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity])
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
