import { Module } from '@nestjs/common';
import { DoctorSpecialtyService } from './doctor-specialty.service';
import { DoctorSpecialtyController } from './doctor-specialty.controller';
import { SpecialtyEntity } from './entities/doctor-specialty.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([SpecialtyEntity]), // ✅ Register entities
],
  controllers: [DoctorSpecialtyController],
  providers: [DoctorSpecialtyService],
})
export class DoctorSpecialtyModule {}
