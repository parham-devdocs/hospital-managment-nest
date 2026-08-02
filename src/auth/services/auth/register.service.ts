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
import { FileService} from 'src/file/file.service';

@Injectable()
export class RegsiterService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private dataSource: DataSource,
    private readonly jwtService: JWTService,
    private readonly fileService: FileService
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
    const { email, password, fullName, address, age, gender, phoneNumber } =
      signUpDto;

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

    const { hashedPassword: _, refreshToken: __, ...userResult } = savedUser;

    return {
      user: userResult,
      accessToken,
    };
  }
}
