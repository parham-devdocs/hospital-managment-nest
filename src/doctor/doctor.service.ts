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
import { Repository } from 'typeorm';
import { UserService } from 'src/user/services/user.service';
import { DoctorSpecialtyService } from 'src/doctor-specialty/doctor-specialty.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorEntity)
    private doctorRepository: Repository<DoctorEntity>,
    private userService: UserService,
    private specialtyService: DoctorSpecialtyService,
  ) {}

  async create(createDoctorDto: CreateDoctorDto) {
    try {
      const { certifications, workExperiences, educations, userId, specialty } =
        createDoctorDto;

      const userWithDoctor = await this.userService.findWithDoctor(userId);

      if (userWithDoctor?.doctor) {
        throw new ConflictException('User already has a doctor profile');
      }

      const user = await this.userService.findUserById(userId);

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      let savedSpecialty: any = null;

      if (specialty) {
        const existingSpecialty =
          await this.specialtyService.findDoctorSpecialty({
            id: specialty.id,
            name: specialty.name,
          });

        if (existingSpecialty) {
          savedSpecialty = existingSpecialty;
        } else {
          savedSpecialty =
            await this.specialtyService.createDoctorSpecialty(specialty);
        }
      } else {
        console.log('⚠️ No specialty provided. Skipping specialty creation.');
      }

      const newDoctor = this.doctorRepository.create({
        user,
        specialties: savedSpecialty ? [savedSpecialty] : [],
        educations: educations || [],
        workExperiences: workExperiences || [],
        certifications: certifications || [],
      });

      const savedDoctor = await this.doctorRepository.save(newDoctor);

      console.log('✅ Doctor saved successfully!');
      console.log('📋 Saved doctor details:', {
        id: savedDoctor.id,
        userId: savedDoctor.user?.id,
        specialtiesCount: savedDoctor.specialties?.length || 0,
        educationsCount: savedDoctor.educations?.length || 0,
        workExperiencesCount: savedDoctor.workExperiences?.length || 0,
        certificationsCount: savedDoctor.certifications?.length || 0,
        createdAt: savedDoctor.createdAt,
        updatedAt: savedDoctor.updatedAt,
      });

      // 6. Return formatted response
      console.log('🔵 [create] Finished successfully');

      return {
        status: 'success',
        message: 'Doctor profile created successfully',
        data: savedDoctor,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new BadRequestException(
        `Failed to create doctor: ${error.message}`,
      );
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
      .leftJoinAndSelect('doctor.specialties', 'specialty')  // Use leftJoinAndSelect
      .leftJoin('doctor.user', 'user')
      .where('doctor.deleteAt IS NULL')
      .andWhere('user.isActive = :isActive', { isActive });
  
    // Filter by full name
    if (fullName) {
      queryBuilder.andWhere('user.fullName ILIKE :fullName', { 
        fullName: `%${fullName}%` 
      });
    }
  
    // Filter by specialties
    if (specialties && specialties.length > 0) {
      const specialtyNames = Array.isArray(specialties) ? specialties : [specialties];
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
      'user.isActive'
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
      specialties: doctor.specialties?.map(s => s.name) || [],
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
    const doctorsWithCount = await this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoin('doctor.user', 'user')
      .addSelect([
        'user.id',
        'user.fullName',
        'user.email',
        'user.phoneNumber',
        'user.gender',
        'user.address',
        'user.avatar_url',
        'user.isActive',
      ])
      .addSelect('doctor.educations', 'educations')
      .addSelect('doctor.workExperiences', 'workExperiences')
      .addSelect('doctor.certifications', 'certifications')
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

    return {
      success: true,
      status: 200,
      data: {
        id: doctor.id,
        userId: doctor.user?.id,
        fullName: doctor.user?.fullName,
        email: doctor.user?.email,
        phoneNumber: doctor.user?.phoneNumber,
        gender: doctor.user?.gender,
        address: doctor.user?.address,
        avatarUrl: doctor.user?.avatar_url,
        isActive: doctor.user?.isActive,
        specialties: doctor.specialties || [],
        educations: doctor.educations || [],
        workExperiences: doctor.workExperiences || [],
        certifications: doctor.certifications || [],
        certificationCount: doctor.certifications?.length || 0,
        educationCount: doctor.educations?.length || 0,
        workExperienceCount: doctor.workExperiences?.length || 0,
        createdAt: doctor.createdAt,
        updatedAt: doctor.updatedAt,
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
