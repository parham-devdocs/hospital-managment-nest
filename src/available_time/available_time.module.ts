// available-time.module.ts
import { Module } from '@nestjs/common';
import { AvailableTimeService } from './services/available_time.service';
import { AvailableTimeController } from './available_time.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeAvailability } from './entities/available_time.entity';
import { TimeHelper } from './services/timeHelper.service';
import { DoctorModule } from 'src/doctor/doctor.module'; // ✅ Import DoctorModule

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeAvailability]),
    DoctorModule, // ✅ Add this import
  ],
  controllers: [AvailableTimeController],
  providers: [AvailableTimeService, TimeHelper], // ✅ Remove DoctorService from providers
})
export class AvailableTimeModule {}