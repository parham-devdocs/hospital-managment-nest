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
import { Repository } from 'typeorm';
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
    try{
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
  }
    catch (error) {
      // 7. Handle database unique constraint violation
      if (error.code === '23505' || error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          `Time slot ${createAvailableTimeDto.time} on ${createAvailableTimeDto.date} already exists for this doctor`
        );
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all availableTime`;
  }

  findOne(id: number) {
    return `This action returns a #${id} availableTime`;
  }

  update(id: number, updateAvailableTimeDto: UpdateAvailableTimeDto) {
    return `This action updates a #${id} availableTime`;
  }

  remove(id: number) {
    return `This action removes a #${id} availableTime`;
  }
}
