import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { SpecialtyEntity } from '../../doctor-specialty/entities/doctor-specialty.entity';
import { Certification, EducationEntry, WorkExperience } from '../types';
import { TimeAvailability } from 'src/available_time/entities/available_time.entity';

@Entity('doctor')
export class DoctorEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => UserEntity, (user) => user.doctor)
  user: UserEntity;

  @ManyToMany(() => SpecialtyEntity, (specialty) => specialty.doctors, {
    nullable: true,
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  @JoinTable({ name: 'doctor-specialties' })
  specialties: SpecialtyEntity[] | null;

  @OneToMany(() => TimeAvailability, (timeAvailability) => timeAvailability.doctor, {
    cascade: true, // Optional: automatically save related availabilities
    onDelete: 'CASCADE', // If doctor is deleted, delete all their availabilities
  })
  availableTimes: TimeAvailability[];

  
  @Column({ type: 'jsonb', default: [] })
  educations: EducationEntry[];

  @Column({ type: 'jsonb', default: [] })
  workExperiences: WorkExperience[];

  @Column({ type: 'jsonb', default: [] })
  certifications: Certification[];

  @Column({type:"varchar",nullable:true})
  bio?:string
  
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
