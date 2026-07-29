import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentEntity } from './entities/appointment.entity';
import { TimeAvailability } from 'src/available_time/entities/available_time.entity';
import { PatientsModule } from 'src/patients/patients.module';
import { DoctorModule } from 'src/doctor/doctor.module';
import { AvailableTimeModule } from 'src/available_time/available_time.module'; // Import this instead
import { FindPatientService } from 'src/patients/services/findPatient.service';
import { AvailableTimeService } from 'src/available_time/services/available_time.service';
import { PatientEntity } from 'src/patients/entities/patient.entity';
import { DoctorService } from 'src/doctor/doctor.service';
import { DoctorEntity } from 'src/doctor/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppointmentEntity, PatientEntity]),
    DoctorModule,
    AvailableTimeModule,
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, FindPatientService],
})
export class AppointmentModule {}
