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
    const { certifications, workExperiences, educations, userId, specialties } =
      createDoctorDto;

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
  findAll() {
    return `This action returns all doctor`;
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
