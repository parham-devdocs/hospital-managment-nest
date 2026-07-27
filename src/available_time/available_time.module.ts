import { Module } from '@nestjs/common';
import { AvailableTimeService } from './available_time.service';
import { AvailableTimeController } from './available_time.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeAvailability } from './entities/available_time.entity';

@Module({
  imports:[    TypeOrmModule.forFeature([TimeAvailability])],
  controllers: [AvailableTimeController],
  providers: [AvailableTimeService],
})
export class AvailableTimeModule {}
