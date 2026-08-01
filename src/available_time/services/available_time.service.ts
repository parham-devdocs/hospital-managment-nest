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
import { IsNull, MoreThan, Repository } from 'typeorm';
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

  async findAllAvailableTimesOfDoctor(doctorId:string) {
    const doctorExists = await this.doctorService.findOne(doctorId);
    if (!doctorExists) {
      throw new NotFoundException('doctor does not exist');
    }
    const now = new Date();

    const availableTimes = await this.timeAvailibilityRepo.find({
      where: { date: MoreThan(now), doctor: { id: doctorId },appointmentId:IsNull() },
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
  async findOne(availabilityId: string) {
    // Find the time availability by ID with relations
    const availability = await this.timeAvailibilityRepo.findOne({
        where: { id: availabilityId },
        relations: {
            doctor: {
                user: true
            },
            appointment: true // Include appointment to check if booked
        }
    });

    if (!availability) {
        throw new NotFoundException(`Time availability with ID ${availabilityId} not found`);
    }

    return {
        success: true,
        statusCode: 200,
        data: {
            id: availability.id,
            date: availability.date,
            time: availability.time,
            doctorId: availability.doctor?.id,
            doctorName: availability.doctor?.user?.fullName || 'N/A',
            isBooked: !!availability.appointment,
            appointmentId: availability.appointment?.id || null,
            createdAt: availability.createdAt,
            updatedAt: availability.updatedAt,
        }
    };
}


async getIsBooked(availabilityId: string) {
    // Fetch just the appointment relation to check if booked
    const availability = await this.timeAvailibilityRepo.findOne({
        where: { id: availabilityId },
        relations: {appointment:true} // Only load appointment to check booking status
    });

    if (!availability) {
        throw new NotFoundException(`Time availability with ID ${availabilityId} not found`);
    }

    const isBooked = !!availability.appointment;

    return {
        success: true,
        statusCode: 200,
        data: {
            availabilityId: availabilityId,
            isBooked: isBooked,
            appointmentId: availability.appointment?.id || null,
            bookedBy: availability.appointment?.patient?.id || null, // If you want patient info
        }
    };
}
}
