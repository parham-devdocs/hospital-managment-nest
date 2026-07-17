import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './entities/auth.entity';
import { JWTService } from './services/jwt.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService,JWTService],
  imports: [TypeOrmModule.forFeature([AuthEntity])],
})
export class AuthModule {}
