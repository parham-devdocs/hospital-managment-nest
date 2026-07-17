// auth.service.ts
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from '../entities/auth.entity';
import { SignUpAuthDto } from '../dto/signup-auth.dto';
import { HashService } from './hashPassword.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
    private hashPassword: HashService,
  ) {}

  async register(signUpAuthDto: SignUpAuthDto) {
        const existingUser = await this.authRepository.findOne({
      where: { email: signUpAuthDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await this.hashPassword.hash(signUpAuthDto.password);

    const newUser = this.authRepository.create({
      email: signUpAuthDto.email,
      hashedPassword  
    });

    const savedUser = await this.authRepository.save(newUser);

    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    savedUser.refreshToken = refreshToken;
    await this.authRepository.save(savedUser);

  
    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: savedUser.id,
        email: savedUser.email,
      },
      accessToken
    };
  }
}