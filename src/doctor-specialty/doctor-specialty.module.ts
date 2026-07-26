import { Module } from '@nestjs/common';
import { DoctorSpecialtyService } from './doctor-specialty.service';
import { DoctorSpecialtyController } from './doctor-specialty.controller';
import { SpecialtyEntity } from './entities/doctor-specialty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorEntity } from 'src/doctor/entities/doctor.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpecialtyEntity,DoctorEntity]), // ✅ Register entities
],
  controllers: [DoctorSpecialtyController],
  providers: [DoctorSpecialtyService],
})
export class DoctorSpecialtyModule {}
