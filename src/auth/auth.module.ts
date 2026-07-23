import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { RegsiterService } from './services/auth/register.service';
import { LoginService } from './services/auth/login.service';
import { AuthService } from './services/auth/auth.service';
import { LogoutService } from './services/auth/logout.service';
import { PasswordService } from './services/password.service';
import { JWTService } from './services/jwt.service';
import { UserEntity } from 'src/user/entities/user.entity';

@Module({
  controllers: [RegisterController, LoginController],
  providers: [RegsiterService,AuthService,LoginService,LogoutService,RegsiterService, PasswordService,JWTService],
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
