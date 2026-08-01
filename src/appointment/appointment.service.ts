import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AppointmentEntity } from './entities/appointment.entity';
import { Between, LessThan, Repository } from 'typeorm';
import { FindPatientService } from 'src/patients/services/findPatient.service';
import { DoctorService } from 'src/doctor/doctor.service';
import { AvailableTimeService } from 'src/available_time/services/available_time.service';
import { AppointmentStatus } from './types';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {type Cache } from 'cache-manager';
import { AppointmentQueryDto } from './dto/find-appointment-query.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentEntity)
    private appointmentRepo: Repository<AppointmentEntity>,
    private readonly findPatientService: FindPatientService,
    private readonly availableTimeService: AvailableTimeService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache


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
        patientName:
          appointmentWithRelations?.patient?.user?.fullName || 'Unknown',
        doctorName:
          appointmentWithRelations?.availableTime?.doctor?.user?.fullName ||
          'Unknown',
        date: appointmentWithRelations?.availableTime?.date,
      },
    };
  }


  // ==================== FIND ALL APPOINTMENTS ====================
  async findAllAppointments(
   { from,
    to,
    sortBy = 'date', 
    status,
    doctorId,
    patientId,
    limit=10,
    page = 1,
    order = 'ASC'}:AppointmentQueryDto
  ) {

    if (from > to) {
      throw new BadRequestException('From date must be before to date');
    }

    const skip = (page - 1) * limit;

    const queryBuilder = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.availableTime', 'availableTime')
      .leftJoin('availableTime.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')

      .leftJoin('appointment.patient', 'patient')
      .leftJoin('patient.user', 'patientUser')
      // ✅ FIX 1: Use andWhere() for multiple conditions
      .where('availableTime.date BETWEEN :from AND :to', { from, to });

    if (status) {
      queryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (doctorId) {
      queryBuilder.andWhere('doctor.id = :doctorId', { doctorId });
    }
    if (patientId) {
      queryBuilder.andWhere('patient.id = :patientId', {patientId });
    }

    const sortFieldMap: Record<string, string> = {
      date: 'availableTime.date',
      startTime: 'availableTime.startTime',
      endTime: 'availableTime.endTime',
      createdAt: 'appointment.createdAt',
      updatedAt: 'appointment.updatedAt',
      status: 'appointment.status',
      doctorName: 'doctorUser.fullName',
      patientName: 'patientUser.fullName',
      description: 'appointment.description',
      id: 'appointment.id',
    };

    const sortField = sortFieldMap[sortBy] || 'availableTime.date';
    queryBuilder.orderBy(sortField, order);

    if (sortField !== 'appointment.id') {
      queryBuilder.addOrderBy('appointment.id', order);
    }

    queryBuilder.skip(skip).take(limit);

    const appointments = await queryBuilder
      .select([
        'appointment.id AS id',
        'appointment.description AS description',
        'appointment.status AS status',
        'appointment.createdAt AS createdAt',
        'availableTime.id AS availableTimeId',
        'availableTime.date AS date',
        'doctor.id AS doctorId',
        'doctorUser.fullName AS doctorName',
        'patient.id AS patientId',
        'patientUser.fullName AS patientName',
      ])
      .getRawMany();

    const totalQueryBuilder = this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.availableTime', 'availableTime')
      .leftJoin('availableTime.doctor', 'doctor')
      .where('availableTime.date BETWEEN :from AND :to', { from, to });

    if (status) {
      totalQueryBuilder.andWhere('appointment.status = :status', { status });
    }

    if (doctorId) {
      totalQueryBuilder.andWhere('doctor.id = :doctorId', { doctorId });
    }

    const total = await totalQueryBuilder.getCount();
    console.log(`✅ Query executed, returning ${total} results`);


    return {
      statusCode: 200,
      success: true,
      message:
        appointments.length > 0
          ? 'Appointments retrieved successfully'
          : 'No appointments found in this date range',
      data: appointments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      sorting: {
        sortBy,
        order,
      },
      filters: {
        from,
        to,
        status: status || null,
        doctorId: doctorId || null,
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
      doctorName:
        appointment?.availableTime?.doctor?.user?.fullName || 'Unknown',
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
