import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DoctorEntity } from './entities/doctor.entity';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import bcrypt from "bcrypt";
@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorEntity)
    private doctorRepository: Repository<DoctorEntity>,

    private dataSource: DataSource,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create user from DTO
      const hashedPassword = await bcrypt.hash(createDoctorDto.user.password, 10);
      
      const newUser = queryRunner.manager.create(UserEntity, {
        fullName: createDoctorDto.user.fullName,
        address: createDoctorDto.user.address,
        age: createDoctorDto.user.age,
        gender: createDoctorDto.user.gender,
        hashedPassword: hashedPassword,
        email: createDoctorDto.user.email,
        phoneNumber: createDoctorDto.user.phoneNumber,
        avatar_url:""
        // refreshToken will be set later
      });
      
      await queryRunner.manager.save(newUser);

      // 2. Create doctor with the new user
      const newDoctor = queryRunner.manager.create(DoctorEntity, {
        user: newUser,  // Link the doctor to the user
        bio: createDoctorDto.bio,
        specialties: createDoctorDto.specialty ? [createDoctorDto.specialty] : [],
        educations: createDoctorDto.educations,
        workExperiences: createDoctorDto.workExperiences,
        certifications: createDoctorDto.certifications,
      });

      await queryRunner.manager.save(newDoctor);
      await queryRunner.commitTransaction();

      // Return the created doctor with user
      return await this.doctorRepository.findOne({
        where: { id: newDoctor.id },
      });

    } catch (error) {
      await queryRunner.rollbackTransaction();
      
      if (error.code === '23505') { // PostgreSQL unique violation
        throw new ConflictException('User with this email already exists');
      }
      
      throw new BadRequestException(`Failed to create doctor: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    pageNum: number = 1,
    limitNum: number = 10,
    specialties?: string[],
    fullName?: string,
    isActive: boolean = true,
  ) {
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const queryBuilder = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.specialties', 'specialty') // Use leftJoinAndSelect
      .leftJoin('doctor.user', 'user')
      .where('doctor.deleteAt IS NULL')
      .andWhere('user.isActive = :isActive', { isActive });

    // Filter by full name
    if (fullName) {
      queryBuilder.andWhere('user.fullName ILIKE :fullName', {
        fullName: `%${fullName}%`,
      });
    }

    // Filter by specialties
    if (specialties && specialties.length > 0) {
      const specialtyNames = Array.isArray(specialties)
        ? specialties
        : [specialties];
      queryBuilder.andWhere('specialty.name IN (:...specialtyNames)', {
        specialtyNames,
      });
    }

    queryBuilder.select([
      'doctor.id',
      'doctor.certifications',
      'doctor.educations',
      'doctor.workExperiences',
      'doctor.createdAt',
      'doctor.updatedAt',
      'specialty.id',
      'specialty.name',
      'user.id',
      'user.fullName',
      'user.email',
      'user.phoneNumber',
      'user.gender',
      'user.avatar_url',
      'user.isActive',
    ]);

    const totalCount = await queryBuilder.getCount();

    const doctors = await queryBuilder
      .skip(skip)
      .take(take)
      .orderBy('doctor.createdAt', 'DESC')
      .getMany();

    if (doctors.length === 0) {
      return {
        success: true,
        status: 200,
        data: [],
        pagination: {
          currentPage: pageNum,
          perPage: limitNum,
          totalItems: 0,
          totalPages: 0,
        },
      };
    }

    // Format the response
    const formattedData = doctors.map((doctor) => ({
      doctorId: doctor.id,
      fullName: doctor.user.fullName,
      email: doctor.user.email,
      phoneNumber: doctor.user.phoneNumber,
      gender: doctor.user.gender,
      avatarUrl: doctor.user.avatar_url,
      isActive: doctor.user.isActive,
      specialties: doctor.specialties?.map((s) => s.name) || [],
      certificationCount: doctor.certifications?.length || 0,
      educationCount: doctor.educations?.length || 0,
      workExperienceCount: doctor.workExperiences?.length || 0,
      createdAt: doctor.createdAt,
      updatedAt: doctor.updatedAt,
    }));

    return {
      success: true,
      status: 200,
      data: formattedData,
      pagination: {
        currentPage: pageNum,
        perPage: limitNum,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    };
  }
  async findOne(id: string) {
    // 1. پیدا کردن دکتر با specialties
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: { specialties: true },
    });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }

    // 2. گرفتن اطلاعات اضافی با QueryBuilder
    const doctorWithCount = await this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoin('doctor.user', 'user')
      .addSelect([
        'doctor.certifications',
        'doctor.educations',
        'doctor.workExperiences',
        'doctor.createdAt',
        'doctor.updatedAt',
        'user.id',
        'doctor.bio',
        'user.fullName',
        'user.email',
        'user.phoneNumber',
        'user.gender',
        'user.address',
        'user.avatar_url',
        'user.isActive',
      ])

      .addSelect(
        'COALESCE(jsonb_array_length(doctor.certifications), 0)',
        'certificationCount',
      )
      .addSelect(
        'COALESCE(jsonb_array_length(doctor.educations), 0)',
        'educationCount',
      )
      .addSelect(
        'COALESCE(jsonb_array_length(doctor.workExperiences), 0)',
        'workExperienceCount',
      )
      .where('doctor.id = :id', { id })
      .getOne();
    console.log({ educations: doctorWithCount?.educations });
    return {
      success: true,
      status: 200,
      data: {
        id: doctorWithCount?.id,
        userId: doctorWithCount?.user?.id,
        fullName: doctorWithCount?.user?.fullName,
        email: doctorWithCount?.user?.email,
        phoneNumber: doctorWithCount?.user?.phoneNumber,
        gender: doctorWithCount?.user?.gender,
        bio: doctorWithCount?.bio,
        address: doctorWithCount?.user?.address,
        avatarUrl: doctorWithCount?.user?.avatar_url,
        isActive: doctorWithCount?.user?.isActive,
        specialties: doctorWithCount?.specialties || [],
        educations: doctorWithCount?.educations || [],
        workExperiences: doctorWithCount?.workExperiences || [],
        certifications: doctorWithCount?.certifications || [],
        certificationCount: doctorWithCount?.certifications?.length || 0,
        educationCount: doctorWithCount?.educations?.length || 0,
        workExperienceCount: doctorWithCount?.workExperiences?.length || 0,
        createdAt: doctorWithCount?.createdAt,
        updatedAt: doctorWithCount?.updatedAt,
      },
    };
  }
  async update(id: string, updateDoctorDto: UpdateDoctorDto) {
    const doctorExists = await this.doctorRepository.findOne({
      where: { id },
    });

    if (!doctorExists) {
      throw new NotFoundException(`Doctor with ID ${id} does not exist`);
    }
    const updatedDoctor = await this.doctorRepository.update(
      id,
      updateDoctorDto,
    );
    if (updatedDoctor.affected) {
      return {
        statue: 201,
        message: 'doctor updated successfully',
      };
    }
  }

  async remove(id: string) {
    // Check if doctor exists - use findOne, not find
    const doctorExists = await this.doctorRepository.findOne({
      where: { id },
    });

    if (!doctorExists) {
      throw new NotFoundException(`Doctor with ID ${id} does not exist`);
    }

    // Perform the delete
    await this.doctorRepository.delete(id);

    return {
      success: true,
      status: 200,
      message: `Doctor with ID ${id} successfully deleted`,
    };
  }
}
