import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAvailableTimeDto } from '../dto/create-available_time.dto';
import { UpdateAvailableTimeDto } from '../dto/update-available_time.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TimeAvailability } from '../entities/available_time.entity';
import { MoreThan, Repository } from 'typeorm';
import { DoctorService } from 'src/doctor/doctor.service';
import { TimeHelper } from './timeHelper.service';

@Injectable()
export class AvailableTimeService {
  constructor(
    @InjectRepository(TimeAvailability)
    private timeAvailibilityRepo: Repository<TimeAvailability>,
    private readonly doctorService: DoctorService,
    private readonly timeHelper: TimeHelper,
  ) {}
  async create(
    createAvailableTimeDto: CreateAvailableTimeDto,
    doctorId: string,
  ) {
    try {
      const { time, date } = createAvailableTimeDto;

      const doctorExists = await this.doctorService.findOne(doctorId);
      if (!doctorExists) {
        throw new NotFoundException('doctor does not exist');
      }

      if (!this.timeHelper.isValidTimeFormat(time)) {
        throw new BadRequestException(
          'Invalid time format. Use HH:MM-HH:MM (e.g., 09:00-10:00)',
        );
      }

      if (this.timeHelper.isDateInPast(date)) {
        throw new BadRequestException(
          'Cannot create availability for past dates',
        );
      }

      const newAvailableTime = this.timeAvailibilityRepo.create({
        time,
        date,
        doctor: { id: doctorId },
      });
      const savedAvailableTime =
        await this.timeAvailibilityRepo.save(newAvailableTime);
      return {
        status: 201, // Created
        success: true,
        message: 'Time availability created successfully',
        data: {
          id: savedAvailableTime.id,
          time: savedAvailableTime.time,
          date: savedAvailableTime.date,
          doctorId: doctorId,
          createdAt: savedAvailableTime.createdAt,
        },
      };
    } catch (error) {
      // 7. Handle database unique constraint violation
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          `Time slot ${createAvailableTimeDto.time} on ${createAvailableTimeDto.date} already exists for this doctor`,
        );
      }
      throw error;
    }
  }

  async findAllAvailableTimesOfDoctor(doctorId) {
    const doctorExists = await this.doctorService.findOne(doctorId);
    if (!doctorExists) {
      throw new NotFoundException('doctor does not exist');
    }
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const availableTimes = await this.timeAvailibilityRepo.find({
      where: { date: MoreThan(now), doctor: { id: doctorId } },
    });

    return { availableTimes };
  }
  async update(
    updateAvailableTimeDto: UpdateAvailableTimeDto,
    doctorId: string,
  ) {
    const doctorExists = await this.doctorService.findOne(doctorId);
    if (!doctorExists) {
      throw new NotFoundException(`Doctor with ID ${doctorId} does not exist`);
    }
    const updatedAvailableTime = await this.timeAvailibilityRepo.update(
      doctorId,
      updateAvailableTimeDto,
    );

    if (updatedAvailableTime.affected && updatedAvailableTime.affected > 0) {
      return {
        success: true,
        statusCode: 200,
        message: `Available time updated successfully for doctor ${doctorId}`,
        data: updateAvailableTimeDto,
      };
    } else {
      throw new NotFoundException(
        `No available time record found for doctor ${doctorId} to update`,
      );
    }
  }

  async remove(doctorId:string) {
    const doctorExists = await this.doctorService.findOne(doctorId);
    if (!doctorExists) {
      throw new NotFoundException(`Doctor with ID ${doctorId} does not exist`);
    }
    const removedDoctor=await this.doctorService.remove(doctorId)

return {
  status:removedDoctor.status,
  success:removedDoctor.success,
  message:removedDoctor.message
}
  }
}
