// patients/patients.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ Add this
import { PatientController } from './patient.controller';
import { PatientEntity } from './entities/patient.entity';
import { AuthEntity } from '../auth/entities/auth.entity';
import { UserModule } from '../user/user.module';
import { CreatePatientService } from './services/createPatient.service';
import { FindPatientService } from './services/findPatient.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientEntity]), // ✅ Register entities
    TypeOrmModule.forFeature([AuthEntity]), // ✅ Register entities
    UserModule, // ✅ Import UserModule
  ],
  controllers: [PatientController],
  providers: [CreatePatientService,FindPatientService],
  exports: [CreatePatientService],
})
export class PatientsModule {}