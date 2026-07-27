import { AppointmentEntity } from 'src/appointment/entities/appointment.entity';
import { DoctorEntity } from 'src/doctor/entities/doctor.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
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
  doctor: DoctorEntity;

  @OneToOne(()=>AppointmentEntity,(appointment)=>appointment.availableTime)
  appointment:AppointmentEntity

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
