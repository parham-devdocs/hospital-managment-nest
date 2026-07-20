import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthEntity } from '../../entities/auth.entity';
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto';
import { JWTService } from '../jwt.service';
import { RegisterServiceResponse } from 'src/auth/types';

@Injectable()
export class RegsiterService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private dataSource: DataSource,
    private readonly jwtService: JWTService,
  ) {}

  async register(signUpDto: RegisterAuthDto): Promise<RegisterServiceResponse> {
    const {
      email,
      password,
      fullName,
      address,
      age,
      gender,
      phoneNumber,
      avatar_url,
    } = signUpDto;

    const existingUser = await this.authRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.authRepository.create({
      email,
      hashedPassword,
      fullName,
      phoneNumber,
      address,
      age,
      avatar_url,
      gender,
    });

    const savedUser = await this.authRepository.save(newUser);

    const accessToken = await this.jwtService.generateToken(
      savedUser.id,
      savedUser.email,
    );
    const refreshToken = await this.jwtService.generateRefreshToken(
      savedUser.id,
      savedUser.email,
    );

    savedUser.refreshToken = refreshToken;

    const { hashedPassword: _, refreshToken: __, ...userResult } = savedUser;

    return {
      user: userResult,
      accessToken,
    };
  }
}
