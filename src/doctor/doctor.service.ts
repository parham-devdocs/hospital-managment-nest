import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DoctorEntity } from './entities/doctor.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/services/user.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorEntity)
    private doctorRepository: Repository<DoctorEntity>,

    private userService: UserService,
  ) {}
  async create(createDoctorDto: CreateDoctorDto) {
    const { certifications, workExperiences, educations, userId, specialties } = createDoctorDto;
  
    // ✅ Check if user exists and already has a doctor profile
    const userWithDoctor = await this.userService.findWithDoctor(userId);
  
    // ✅ If user already has a doctor profile, throw an error
    if (userWithDoctor?.doctor) {
      throw new ConflictException('User already has a doctor profile');
    }
  
    // ✅ Get the user (ensures user exists)
    const user = await this.userService.findUserById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  
    // ✅ Create the doctor entity
    const newDoctor = this.doctorRepository.create({
      user,
      specialties,
      educations,
      workExperiences,
      certifications,
    });
  
    // ✅ Save the doctor
    const savedDoctor = await this.doctorRepository.save(newDoctor);
  
    // ✅ Return a formatted response
    return {
      status: 'success',
      message: 'Doctor profile created successfully',
      data: {
        id: savedDoctor.id,
        userId: savedDoctor.user.id,
        specialties: savedDoctor.specialties,
        educationCount: savedDoctor.educations?.length || 0,
        experienceCount: savedDoctor.workExperiences?.length || 0,
        certificationCount: savedDoctor.certifications?.length || 0,
        createdAt: savedDoctor.createdAt,
      },
    };
  }
  
  async findAll(pageNum: number, limitNum: number) {
    // 1. Calculate pagination
    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;
  
    // 2. Get doctors with specialties
    const doctors = await this.doctorRepository.find({
      skip: skip,
      take: take,
      relations: { specialties: true },
    });
  
    // 3. If no doctors found, return early
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
  
    // 4. Get doctor IDs for counts query
    const doctorIds = doctors.map(d => d.id);
  
    // 5. Get counts and user info in one query
    const doctorsWithCounts = await this.doctorRepository
      .createQueryBuilder('doctor')
      .select('doctor.id', 'doctorId')
      .addSelect('COALESCE(jsonb_array_length(doctor.certifications), 0)', 'certificationCount')
      .addSelect('COALESCE(jsonb_array_length(doctor.educations), 0)', 'educationCount')
      .addSelect('COALESCE(jsonb_array_length(doctor.workExperiences), 0)', 'workExperienceCount')
      .leftJoin('doctor.user', 'profile')
      .addSelect('profile.id', 'userId')
      .addSelect('profile.fullName', 'fullName')
      .addSelect('profile.email', 'email')
      .addSelect('profile.phoneNumber', 'phoneNumber')
      .addSelect('profile.gender', 'gender')
      .addSelect('profile.avatar_url', 'avatar_url')
      .addSelect('profile.isActive', 'isActive')
      .where('doctor.id IN (:...ids)', { ids: doctorIds })
      .getRawMany();
  
    // 6. Get total count for pagination
    const totalCount = await this.doctorRepository.count();
  
    // 7. Merge specialties with the results
    const formattedData = doctorsWithCounts.map(doctor => {
      const doctorEntity = doctors.find(d => d.id === doctor.doctorId);
      return {
        id: doctor.doctorId,
        userId: doctor.userId,
        fullName: doctor.fullName,
        email: doctor.email,
        phoneNumber: doctor.phoneNumber,
        gender: doctor.gender,
        avatarUrl: doctor.avatarUrl,
        isActive: doctor.isActive,
        specialties: doctorEntity?.specialties || [],
        certificationCount: parseInt(doctor.certificationCount),
        educationCount: parseInt(doctor.educationCount),
        workExperienceCount: parseInt(doctor.workExperienceCount),
      };
    });
  
    // 8. Return formatted response
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

  findOne(id: number) {
    return `This action returns a #${id} doctor`;
  }

  update(id: number, updateDoctorDto: UpdateDoctorDto) {
    return `This action updates a #${id} doctor`;
  }

  remove(id: number) {
    return `This action removes a #${id} doctor`;
  }
}
