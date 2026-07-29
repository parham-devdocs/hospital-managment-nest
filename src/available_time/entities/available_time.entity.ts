import { AppointmentEntity } from 'src/appointment/entities/appointment.entity';
import { DoctorEntity } from 'src/doctor/entities/doctor.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity('time-availability')
@Unique(['date', 'time', 'doctor'])
export class TimeAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({ type: 'varchar', nullable: false })
  time: string;

  // Many-to-One: Many availabilities belong to one doctor
  @ManyToOne(() => DoctorEntity, (doctor) => doctor.availableTimes)
  @JoinColumn({ name: 'doctorId' }) // ← Good practice: explicit FK name
  doctor: DoctorEntity;

  @Column({ type: 'uuid', nullable: false })
  doctorId: string; // ← Add this for direct access

  // ✅ FIXED: One-to-One with Appointment
  @OneToOne(() => AppointmentEntity, (appointment) => appointment.availableTime)
  @JoinColumn({ name: 'appointmentId' }) // ← FIX: Attach to the decorator!
  appointment: AppointmentEntity;

  // ✅ FIXED: Correct type - string, not AppointmentEntity
  @Column({ type: 'uuid', nullable: true })
  appointmentId: string; // ← This stores the FK as a UUID string

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}