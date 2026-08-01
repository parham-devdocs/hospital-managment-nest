import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto';
import { JWTService } from '../jwt.service';
import { RegisterServiceResponse } from 'src/auth/types';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class RegsiterService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.create({
      email,
      hashedPassword,
      fullName,
      phoneNumber,
      address,
      age,
      avatar_url,
      gender,
    });

    const savedUser = await this.userRepository.save(newUser);

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
