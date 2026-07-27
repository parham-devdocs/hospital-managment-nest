import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorEntity } from './entities/doctor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { DoctorSpecialtyService } from 'src/doctor-specialty/doctor-specialty.service';
import { SpecialtyEntity } from 'src/doctor-specialty/entities/doctor-specialty.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorEntity,SpecialtyEntity]), // ✅ Register entities
    UserModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService,DoctorSpecialtyService],
})
export class DoctorModule {}
