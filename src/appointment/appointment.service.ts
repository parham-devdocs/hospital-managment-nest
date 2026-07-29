import {
  ConflictException,
  Injectable,
  NotFoundException,
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
  async create(createAppointmentDto: CreateAppointmentDto) {
    // 1. Validate patient exists
    console.log(createAppointmentDto);
    const patientExists = await this.findPatientService.findById(
      createAppointmentDto.patientId,
    );
    if (!patientExists) {
      throw new NotFoundException(
        `Patient with ID ${createAppointmentDto.patientId} does not exist`,
      );
    }
    const availableTime = await this.availableTimeService.findOne(
      '1661b720-c26e-4404-855f-e9253d41210e',
    );
    if (!availableTime) {
      throw new NotFoundException(
        `Time slot with ID ${createAppointmentDto.availableTimeId} does not exist`,
      );
    }

    const isBooked = await this.availableTimeService.getIsBooked(
      createAppointmentDto.availableTimeId,
    );
    if (isBooked.data.isBooked) {
      throw new ConflictException(
        `Time slot ${createAppointmentDto.availableTimeId} is already booked`,
      );
    }

    const newAppointment = this.appointmentRepo.create({
      patient: { id: createAppointmentDto.patientId },
      availableTime: { id: createAppointmentDto.availableTimeId },
      description: createAppointmentDto.description,
    });

    const savedAppointment = await this.appointmentRepo.save(newAppointment);

    return {
      statusCode: 201, // 201 is more appropriate for creation
      success: true,
      message: 'Appointment created successfully',
      data: {
        id: savedAppointment.id,
        patientId: savedAppointment.patient.id,
        availableTimeId: savedAppointment.availableTime.id,
        description: savedAppointment.description,
        createdAt: savedAppointment.createdAt,
        // Include doctor info if needed
        doctorId: savedAppointment.availableTime?.doctor?.id,
      },
    };
  }

  async findAppointmentsOfDoctor(doctorId: string, from: Date, to: Date) {
    const doctorExists = await this.doctorService.findOne(doctorId);
    if (!doctorExists) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
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
        'patientUser.fullName AS patientName'
      ])
      .getRawMany();
  
    const count = appointments.length;
  
    return {
      statusCode: 200,
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments,
      total: count,
    };
  }

  async findAllAppointments(from:Date,to:Date) {
    const appointments = await this.appointmentRepo
      .createQueryBuilder('appointment')
      .leftJoin('appointment.availableTime', 'availableTime')
      .leftJoin('availableTime.doctor', 'doctor')
      .leftJoin('doctor.user', 'doctorUser')
      .leftJoin('appointment.patient', 'patient')
      .leftJoin('patient.user', 'patientUser')
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
        'patientUser.fullName AS patientName'
      ])
      .getRawMany();
  
    const count = appointments.length;
  
    return {
      statusCode: 200,
      success: true,
      message: 'Appointments retrieved successfully',
      data: appointments,
      total: count,
    };
  }

  update(id: number, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  remove(id: number) {
    return `This action removes a #${id} appointment`;
  }
}
