import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { HashService } from './services/hashPassword.service';
import { JwtModule } from '@nestjs/jwt';
import { RegisterController } from './controllers/register.controller';
import { LoginController } from './controllers/login.controller';
import { ProfileEntity } from 'src/profile/entities/profile.entity';

@Module({
  controllers: [RegisterController,LoginController],
  providers: [AuthService, HashService],
  imports: [
    TypeOrmModule.forFeature([AuthEntity,ProfileEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class AuthModule {}
