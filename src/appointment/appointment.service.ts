import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentEntity } from './entities/appointment.entity';
import { Between, LessThan, Repository } from 'typeorm';
import { FindPatientService } from 'src/patients/services/findPatient.service';
import { DoctorService } from 'src/doctor/doctor.service';
import { AvailableTimeService } from 'src/available_time/services/available_time.service';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepo: Repository<AppointmentEntity>,
    private readonly findPatientService: FindPatientService,
    private readonly availableTimeService: AvailableTimeService,
    private readonly doctorService: DoctorService,
  ) {}

  // ==================== CREATE ====================
  async create(createAppointmentDto: CreateAppointmentDto) {
    // 1. Validate patient exists
    const patientExists = await this.findPatientService.findById(
      createAppointmentDto.patientId,
    );
    if (!patientExists) {
      throw new NotFoundException(
        `Patient with ID ${createAppointmentDto.patientId} does not exist`,
      );
    }

    // 2. Validate time slot exists
    const availableTime = await this.availableTimeService.findOne(
      createAppointmentDto.availableTimeId,
    );
    if (!availableTime) {
      throw new NotFoundException(
        `Time slot with ID ${createAppointmentDto.availableTimeId} does not exist`,
      );
    }

    // 3. Check if time slot is already booked
    const isBooked = await this.availableTimeService.getIsBooked(
      createAppointmentDto.availableTimeId,
    );
    if (isBooked.data.isBooked) {
      throw new ConflictException(
        `Time slot ${createAppointmentDto.availableTimeId} is already booked`,
      );
    }

    // 4. Create appointment
    const newAppointment = this.appointmentRepo.create({
      patient: { id: createAppointmentDto.patientId },
      availableTime: { id: createAppointmentDto.availableTimeId },
      description: createAppointmentDto.description,
    });

    const savedAppointment = await this.appointmentRepo.save(newAppointment);

    // 5. Load relations for response
    const appointmentWithRelations = await this.appointmentRepo.findOne({
      where: { id: savedAppointment.id },
      relations: {
        patient: { user: true },
        availableTime: { doctor: { user: true } },
      },
    });

    return {
      statusCode: 201,
      success: true,
      message: 'Appointment created successfully',
      data: {
        id: appointmentWithRelations?.id,
        description: appointmentWithRelations?.description,
        createdAt: appointmentWithRelations?.createdAt,
        patientName: appointmentWithRelations?.patient?.user?.fullName || 'Unknown',
        doctorName: appointmentWithRelations?.availableTime?.doctor?.user?.fullName || 'Unknown',
        date: appointmentWithRelations?.availableTime?.date
      },
    };
  }

  // ==================== FIND BY DOCTOR ====================
  async findAppointmentsOfDoctor(doctorId: string, from: Date, to: Date) {
    // Validate doctor exists
    const doctorExists = await this.doctorService.findOne(doctorId);
    if (!doctorExists) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
    }

    // Validate dates
    if (from > to) {
      throw new BadRequestException('From date must be before to date');
    }

    const appointments = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.availableTime', 'availableTime')
      .leftJoin('availableTime.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .leftJoin('appointment.patient', 'patient')
      .leftJoin('patient.user', 'patientUser')
      .where('doctor.id = :doctorId', { doctorId })
      .andWhere('availableTime.date BETWEEN :from AND :to', { from, to })
      .select([
        'appointment.id AS id',
        'appointment.description AS description',
        'appointment.createdAt AS createdAt',
        'availableTime.id AS availableTimeId',
        'availableTime.date AS date',
        'doctor.id AS doctorId',
        'doctorUser.fullName AS doctorName',
        'patient.id AS patientId',
        'patientUser.fullName AS patientName',
      ])
      .orderBy('availableTime.date', 'ASC')
      .getRawMany();

    return {
      statusCode: 200,
      success: true,
      message: appointments.length > 0 
        ? 'Appointments retrieved successfully' 
        : 'No appointments found in this date range',
      data: appointments,
      total: appointments.length,
      filters: {
        doctorId,
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      },
    };
  }

  // ==================== FIND ALL APPOINTMENTS ====================
  async findAllAppointments(from: Date, to: Date) {
    // Validate dates
    if (from > to) {
      throw new BadRequestException('From date must be before to date');
    }

    const appointments = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.availableTime', 'availableTime')
      .leftJoin('availableTime.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .leftJoin('appointment.patient', 'patient')
      .leftJoin('patient.user', 'patientUser')
      .where('availableTime.date BETWEEN :from AND :to', { from, to })
      .select([
        'appointment.id AS id',
        'appointment.description AS description',
        'appointment.createdAt AS createdAt',
        'availableTime.id AS availableTimeId',
        'availableTime.date AS date',
        'doctor.id AS doctorId',
        'doctorUser.fullName AS doctorName',
        'patient.id AS patientId',
        'patientUser.fullName AS patientName',
      ])
      .orderBy('availableTime.date', 'ASC')
      .getRawMany();

    return {
      statusCode: 200,
      success: true,
      message: appointments.length > 0 
        ? 'Appointments retrieved successfully' 
        : 'No appointments found in this date range',
      data: appointments,
      total: appointments.length,
      filters: {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      },
    };
  }

  // ==================== FIND ONE ====================
  async findOne(id: string) {
    const appointment = await this.appointmentRepo.findOne({
      where: { id },
      relations: {
        patient: { user: true },
        availableTime: { doctor: { user: true } },
      },
    });

    if (!appointment) {
      return null;
    }

    // Transform to flat structure
    return {
      id: appointment.id,
      description: appointment?.description,
      createdAt: appointment?.createdAt,
      updatedAt: appointment?.updatedAt,
      patientName: appointment?.patient?.user?.fullName || 'Unknown',
      doctorName: appointment?.availableTime?.doctor?.user?.fullName || 'Unknown',
      date: appointment?.availableTime?.date,
   
    };
  }

  // ==================== FIND ONE (for internal use) ====================
  async findOneById(id: string): Promise<AppointmentEntity | null> {
    return await this.appointmentRepo.findOne({
      where: { id },
      relations: {
        patient: true,
        availableTime: true,
      },
    });
  }

  // ==================== UPDATE ====================
  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    // 1. Check if appointment exists
    const appointmentExists = await this.findOneById(id);
    if (!appointmentExists) {
      throw new NotFoundException(`Appointment with ID ${id} does not exist`);
    }

    // 2. Validate patient if provided
    if (updateAppointmentDto.patientId) {
      const patientExists = await this.findPatientService.findById(
        updateAppointmentDto.patientId,
      );
      if (!patientExists) {
        throw new NotFoundException(
          `Patient with ID ${updateAppointmentDto.patientId} does not exist`,
        );
      }
    }

    // 3. Validate time slot if provided
    if (updateAppointmentDto.availableTimeId) {
      const availableTime = await this.availableTimeService.findOne(
        updateAppointmentDto.availableTimeId,
      );
      if (!availableTime) {
        throw new NotFoundException(
          `Time slot with ID ${updateAppointmentDto.availableTimeId} does not exist`,
        );
      }

      // Check if slot is already booked (by another appointment)
      const isBooked = await this.availableTimeService.getIsBooked(
        updateAppointmentDto.availableTimeId,
      );
      if (isBooked.data.isBooked) {
        throw new ConflictException(
          `Time slot ${updateAppointmentDto.availableTimeId} is already booked`,
        );
      }
    }

    // 4. Update appointment
    await this.appointmentRepo.update(id, {
      patient: updateAppointmentDto.patientId 
        ? { id: updateAppointmentDto.patientId } 
        : undefined,
      availableTime: updateAppointmentDto.availableTimeId 
        ? { id: updateAppointmentDto.availableTimeId } 
        : undefined,
      description: updateAppointmentDto.description,
    });

    // 5. Get updated appointment
    const updatedAppointment = await this.findOne(id);

    return {
      statusCode: 200,
      success: true,
      message: 'Appointment updated successfully',
      data: updatedAppointment,
    };
  }

  // ==================== REMOVE ====================
  async remove(id: string) {
    // 1. Check if appointment exists
    const appointmentExists = await this.findOneById(id);
    if (!appointmentExists) {
      throw new NotFoundException(`Appointment with ID ${id} does not exist`);
    }

    // 2. Delete appointment
    const removedItem = await this.appointmentRepo.delete({ id });

    if (removedItem.affected && removedItem.affected > 0) {
      return {
        statusCode: 200,
        success: true,
        message: 'Appointment deleted successfully',
        data: {
          id: id,
          deletedAt: new Date().toISOString(),
        },
      };
    }

    throw new NotFoundException(`Failed to delete appointment with ID ${id}`);
  }


}