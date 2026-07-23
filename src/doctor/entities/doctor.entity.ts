import {
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from 'src/user/entities/user.entity';
import { SpecialtyEntity } from '../../doctor-specialty/entities/doctor-specialty.entity';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
