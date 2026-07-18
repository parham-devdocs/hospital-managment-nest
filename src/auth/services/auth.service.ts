// src/auth/auth.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthEntity } from '../entities/auth.entity';
import { ProfileEntity } from 'src/profile/entities/profile.entity';
import { SignUpAuthDto } from '../dto/signup-auth.dto';
import { UserRole } from '../types';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    private dataSource: DataSource,
  ) {}

  async register(signUpDto: SignUpAuthDto): Promise<any> {
    const { email, password, profile } = signUpDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Check if user exists
      const existingUser = await this.authRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // 2. Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 3. Create auth entity with proper values
      const newUser = this.authRepository.create({
        email,                      // ✅ Provide email
        hashedPassword,             // ✅ Provide hashed password
        // id is auto-generated
        // refreshToken is optional
        // createdAt, updatedAt are auto-managed
      });

      // 4. Save the user
      const savedUser = await queryRunner.manager.save(newUser);

      // 5. Create profile with the auth reference
      const newProfile = this.profileRepository.create({
        auth: savedUser,
        authId: savedUser.id,
        fullName: profile.fullName,
        address: profile.address,
        phoneNumber: profile.phoneNumber,
        age: profile.age,
        gender: profile.gender,
      });

      const savedProfile = await queryRunner.manager.save(newProfile);

      // 6. Update user with profile reference
      savedUser.profile = savedProfile;
      await queryRunner.manager.save(savedUser);

      await queryRunner.commitTransaction();

      // 7. Return response (exclude sensitive data)
      const { hashedPassword: _, refreshToken: __, ...userResult } = savedUser;
      const { auth, ...profileResult } = savedProfile;

      return {
        ...userResult,
        profile: profileResult,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}