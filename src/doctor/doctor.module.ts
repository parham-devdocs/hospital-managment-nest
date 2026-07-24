import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorEntity } from './entities/doctor.entity';
import { SpecialtyEntity } from 'src/doctor-specialty/entities/doctor-specialty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorEntity]), // ✅ Register entities
],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
