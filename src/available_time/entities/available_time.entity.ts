// time-availability.entity.ts
import { DoctorEntity } from 'src/doctor/entities/doctor.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('time-availability')
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}