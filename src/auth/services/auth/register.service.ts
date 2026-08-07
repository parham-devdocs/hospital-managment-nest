// register.service.ts
import {
  Injectable,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto';
import { JWTService } from '../jwt.service';
import { RegisterServiceResponse } from 'src/auth/types';
import { UserEntity } from 'src/user/entities/user.entity';
import { FileService } from 'src/file/file.service';
import { LoggerService } from 'src/logger/logger.service';

@Injectable()
export class RegsiterService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private dataSource: DataSource,
    private readonly jwtService: JWTService,
    private readonly fileService: FileService,
    private readonly logger: LoggerService,
  ) {}

  async saveAvatarFile(file: any): Promise<string> {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    const avatarUrl = await this.fileService.uploadFile(file, 'images');
    return avatarUrl.path;
  }

  async register(
    signUpDto: RegisterAuthDto,
    avatarUrl: string,
  ): Promise<RegisterServiceResponse> {
    // Log the incoming data
    this.logger.info('Registration attempt with data', { 
      dtoKeys: Object.keys(signUpDto),
      hasEmail: !!signUpDto.email,
      emailValue: signUpDto.email,
      fullName: signUpDto.fullName,
    });

    const { email, password, fullName, address, age, gender, phoneNumber } = signUpDto;

    // Validate required fields
    if (!email) {
      this.logger.error('Email is missing from registration DTO', null, {
        signUpDto,
        email,
        fullName,
        hasPassword: !!password,
        hasAvatar: !!avatarUrl,
      });
      throw new BadRequestException('Email is required for registration');
    }

    if (!password) {
      this.logger.error('Password is missing from registration DTO', null, {
        email,
        fullName,
      });
      throw new BadRequestException('Password is required for registration');
    }

    if (!fullName) {
      this.logger.error('Full name is missing from registration DTO', null, {
        email,
      });
      throw new BadRequestException('Full name is required for registration');
    }

    // Trim and validate email format
    const trimmedEmail = email.trim().toLowerCase();
    if (!this.isValidEmail(trimmedEmail)) {
      this.logger.warn('Invalid email format provided', { email: trimmedEmail });
      throw new BadRequestException('Invalid email format');
    }

    this.logger.debug('Checking for existing user', { email: trimmedEmail });

    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: trimmedEmail },
      });

      if (existingUser) {
        this.logger.warn('Registration blocked - user already exists', { 
          email: trimmedEmail,
          userId: existingUser.id,
        });
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = this.userRepository.create({
        email: trimmedEmail,
        hashedPassword,
        fullName,
        phoneNumber,
        address,
        age,
        avatar_url: avatarUrl,
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
      await this.userRepository.save(savedUser);

      const { hashedPassword: _, refreshToken: __, ...userResult } = savedUser;

      this.logger.info('User registered successfully', { 
        userId: savedUser.id,
        email: savedUser.email,
      });

      return {
        user: userResult,
        accessToken,
      };
    } catch (error) {
      this.logger.error('Registration failed', error.stack, {
        email: trimmedEmail,
        fullName,
        errorType: error.constructor.name,
      });
      throw error;
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}