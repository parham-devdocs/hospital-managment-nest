import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { LoginController } from './controllers/login.controller';
import { LoginService } from './services/auth/login.service';
import { AuthService } from './services/auth/auth.service';
import { LogoutService } from './services/auth/logout.service';
import { PasswordService } from './services/password.service';
import { JWTService } from './services/jwt.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { FileService } from 'src/file/file.service';
import { LoggerService } from 'src/logger/logger.service';

@Module({
  controllers: [ LoginController],
  providers: [
    AuthService,
    LoginService,
    LogoutService,
    PasswordService,
    JWTService,
    FileService,
    LoggerService
  ],
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports:[AuthService]
})
export class AuthModule {}
