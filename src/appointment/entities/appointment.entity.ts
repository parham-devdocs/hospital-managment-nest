import { TimeAvailability } from 'src/available_time/entities/available_time.entity';
import { PatientEntity } from 'src/patients/entities/patient.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AppointmentStatus } from '../types';

@Entity('appointment')
export class AppointmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PatientEntity, (patient) => patient.appointments)
  patient: PatientEntity;

  @Column({ nullable: false, type: 'varchar' })
  description: string;

  @OneToOne(
    () => TimeAvailability,
    (timeAvailability) => timeAvailability.appointment,
    { cascade: true },
  )
  availableTime: TimeAvailability;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PENDING, 
  })
  status: AppointmentStatus;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
