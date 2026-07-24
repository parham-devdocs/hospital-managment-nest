import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DoctorEntity } from '../../doctor/entities/doctor.entity';

@Entity('specialty')
export class SpecialtyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({name:"name",nullable:false,unique:true})
  name:string
  

  @ManyToMany(() => DoctorEntity, (doctor) => doctor.specialties, {
    nullable: true,
    onDelete: 'NO ACTION',
    onUpdate: 'CASCADE',
  })
  doctors: DoctorEntity[] | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}
