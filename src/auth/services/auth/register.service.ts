import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthEntity } from '../../entities/auth.entity';
import { ProfileEntity } from 'src/profile/entities/profile.entity';
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto';

@Injectable()
export class RegsiterService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(ProfileEntity)
    private profileRepository: Repository<ProfileEntity>,
    private dataSource: DataSource,
  ) {}

  async register(signUpDto: RegisterAuthDto): Promise<any> {
    const { email, password, profile } = signUpDto;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.authRepository.findOne({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.authRepository.create({
        email, 
        hashedPassword,     });

      const savedUser = await queryRunner.manager.save(newUser);

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

      savedUser.profile = savedProfile;
      await queryRunner.manager.save(savedUser);

      await queryRunner.commitTransaction();

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
