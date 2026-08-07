import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorEntity } from './entities/doctor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';
import { DoctorSpecialtyService } from 'src/doctor-specialty/doctor-specialty.service';
import { SpecialtyEntity } from 'src/doctor-specialty/entities/doctor-specialty.entity';

import { AuthModule } from 'src/auth/auth.module';
import { UserEntity } from 'src/user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorEntity,SpecialtyEntity,UserEntity]), // ✅ Register entities
    UserModule,
    AuthModule
  ],
  controllers: [DoctorController],
  providers: [DoctorService,DoctorSpecialtyService],
  exports:[DoctorService]
})
export class DoctorModule {}
