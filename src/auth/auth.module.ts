import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { JWTService } from './services/jwt.service';
import { HashService } from './services/hashPassword.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService,HashService],
  imports: [TypeOrmModule.forFeature([AuthEntity]), JwtModule.register({  // ✅ Register JwtModule here
    secret: process.env.JWT_SECRET || 'your-secret-key',
    signOptions: { expiresIn: '1d' },
  }),],
})
export class AuthModule {}
