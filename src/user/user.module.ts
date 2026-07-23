// user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { FindUserService } from './services/findUser.service';
import { PatientEntity } from '../patients/entities/patient.entity';
import { UserEntity } from './entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, PatientEntity]), // ✅ Register entities
    ],
    providers: [
        UserService,
        FindUserService,
        // ✅ Add any other services here
    ],
    exports: [
        UserService,
        FindUserService, // ✅ Export if used by other modules
    ],
})
export class UserModule {}