import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { HashService } from './services/hashPassword.service';
import { JwtModule } from '@nestjs/jwt';
import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { ProfileEntity } from 'src/profile/entities/profile.entity';
import { RegsiterService } from './services/auth/register.service';
import { LoginService } from './services/auth/login.service';
import { AuthService } from './services/auth/auth.service';
import { LogoutService } from './services/auth/logout.service';

@Module({
  controllers: [RegisterController, LoginController],
  providers: [RegsiterService,AuthService,LoginService,LogoutService,RegsiterService, HashService],
  imports: [
    TypeOrmModule.forFeature([AuthEntity, ProfileEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
