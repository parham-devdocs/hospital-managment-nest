import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { DoctorController } from './doctor.controller';
import { DoctorEntity } from './entities/doctor.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorEntity]), // ✅ Register entities
    UserModule,
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}
