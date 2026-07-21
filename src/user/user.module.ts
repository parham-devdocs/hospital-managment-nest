// user/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './services/user.service';
import { FindUserService } from './services/findUser.service';
import { AuthEntity } from '../auth/entities/auth.entity';
import { PatientEntity } from '../patients/entities/patient.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuthEntity, PatientEntity]), // ✅ Register entities
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