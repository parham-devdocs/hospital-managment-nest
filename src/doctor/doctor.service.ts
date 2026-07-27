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
      const { 
        certifications, 
        workExperiences, 
        educations, 
        userId,
        specialty
      } = createDoctorDto;

   
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

        const existingSpecialty = await this.specialtyService.findDoctorSpecialty({id:specialty.id,name:specialty.name});

        
        if (existingSpecialty) {
       
          savedSpecialty = existingSpecialty
        } else {

          savedSpecialty = await this.specialtyService.createDoctorSpecialty(specialty);
          
   
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
        updatedAt: savedDoctor.updatedAt
      });

      // 6. Return formatted response
      console.log('🔵 [create] Finished successfully');
      
      return {
        status: 'success',
        message: 'Doctor profile created successfully',
        data: savedDoctor,
      };
      
    } catch (error) {
 
      if (error instanceof ConflictException || error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(
        `Failed to create doctor: ${error.message}`
      );
    }
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
    const doctorIds = doctors.map((d) => d.id);

    // 5. Get counts and user info in one query
    const doctorsWithCounts = await this.doctorRepository
      .createQueryBuilder('doctor')
      .select('doctor.id', 'doctorId')
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
    const formattedData = doctorsWithCounts.map((doctor) => {
      const doctorEntity = doctors.find((d) => d.id === doctor.doctorId);
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
            'user.isActive'
        ])
        .addSelect('doctor.educations', 'educations') 
        .addSelect('doctor.workExperiences', 'workExperiences') 
        .addSelect('doctor.certifications', 'certifications') 
                .addSelect(
            'COALESCE(jsonb_array_length(doctor.certifications), 0)',
            'certificationCount'
        )
        .addSelect(
            'COALESCE(jsonb_array_length(doctor.educations), 0)',
            'educationCount'
        )
        .addSelect(
            'COALESCE(jsonb_array_length(doctor.workExperiences), 0)',
            'workExperienceCount'
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
    })

    if (!doctorExists) {
      throw new NotFoundException(`Doctor with ID ${id} does not exist`);
    }
    const updatedDoctor=await this.doctorRepository.update(id,updateDoctorDto)
    if (updatedDoctor.affected) {
      return {
        statue:201,
        message:"doctor updated successfully"
      }
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
