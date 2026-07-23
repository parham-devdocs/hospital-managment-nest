import { Module } from '@nestjs/common';
import { DoctorSpecialtyService } from './doctor-specialty.service';
import { DoctorSpecialtyController } from './doctor-specialty.controller';

@Module({
  controllers: [DoctorSpecialtyController],
  providers: [DoctorSpecialtyService],
})
export class DoctorSpecialtyModule {}
