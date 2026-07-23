// patients/patients.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // ✅ Add this
import { PatientController } from './patient.controller';
import { PatientEntity } from './entities/patient.entity';
import { UserModule } from '../user/user.module';
import { CreatePatientService } from './services/createPatient.service';
import { FindPatientService } from './services/findPatient.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { RemovePatientService } from './services/removePatient.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientEntity]), // ✅ Register entities
    TypeOrmModule.forFeature([UserEntity]), // ✅ Register entities
    UserModule, // ✅ Import UserModule
  ],
  controllers: [PatientController],
  providers: [CreatePatientService,FindPatientService,RemovePatientService],
  exports: [CreatePatientService],
})
export class PatientsModule {}