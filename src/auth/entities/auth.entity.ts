import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Gender, UserRole } from 'src/auth/types';
import { PatientEntity } from 'src/patients/entities/patient.entity';

@Entity('auth')
@Check(`"email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`)
export class AuthEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  hashedPassword: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', nullable: false })
  address: string;

  @Column({ type: 'varchar', nullable: false })
  phoneNumber: string;

  @Column({ type: 'varchar' })
  avatar_url: string;

  @Column({ type: 'varchar', nullable: false })
  fullName: string;
  @Column({ type: 'int', nullable: false })
  age: number;

  @Column({ type: 'enum', enum: Gender, nullable: false })
  gender: Gender;

  @Column({ type: 'enum', enum: UserRole, nullable: false, default: 'Patient' })
  role: UserRole;

  @Column({ type: 'boolean', nullable: false, default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true })
  refreshToken?: string;

  @OneToOne(() => PatientEntity, (patient) => patient.auth, {
    cascade: ['insert', 'update'], 
    eager: false,
    nullable: true 
})
@JoinColumn({ name: 'patientId' })
patient: PatientEntity;

@Column({ nullable: true })
patientId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}