
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto';
import { PasswordService } from '../password.service';
import { JWTService } from '../jwt.service';
import { LoginServiceResponse } from 'src/auth/types';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(UserEntity)
    private authRepository: Repository<UserEntity>,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JWTService,
  ) {}

  async login(loginAuthDto: LoginAuthDto): Promise<LoginServiceResponse> {
    const { email, password } = loginAuthDto;

    try {
      // 1. Find user
      const existingUser = await this.authRepository.findOne({
        where: { email },
      });

      if (!existingUser) {
        throw new NotFoundException('User with this email does not exist');
      }

      // 2. Check if account is active
      if (!existingUser.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // 3. Verify password
      const passwordValidity = await this.passwordService.compare(
        password,
        existingUser.hashedPassword,
      );

      if (!passwordValidity) {
        throw new UnauthorizedException('Invalid password');
      }

      // 4. Generate tokens
      const accessToken = await this.jwtService.generateToken(
        existingUser.id,
        existingUser.email,
      );

      const refreshToken = await this.jwtService.generateRefreshToken(
        existingUser.id,
        existingUser.email,
      );

      // 5. Save refresh token to database
      await this.authRepository.update(
        { id: existingUser.id },
        { refreshToken: refreshToken },
      );

      const { hashedPassword, refreshToken: _, ...userData } = existingUser;

      return {
        user: userData,
        accessToken,
        
      };
    } catch (error) {
      throw error;
    }
  }
}