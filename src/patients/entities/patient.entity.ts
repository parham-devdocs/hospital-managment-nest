import { AuthEntity } from "src/auth/entities/auth.entity";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BloodTypes } from "../type";

@Entity("patient")
export class PatientEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  

  @Column({ type: "varchar", nullable: true }) 
  illness: string;

  @Column({ type: "varchar", nullable: true }) 
  medical_condition_summary: string;

  @Column({ type: "jsonb", nullable: true })
  allergies: string[];

  @Column({ type: "varchar", nullable: true })
  emergencyContact: string;

  @Column({ type: "varchar", nullable: true })
  emergencyPhone: string;

  @Column({ type: "enum",enum:BloodTypes, nullable: true })
  bloodType: BloodTypes;

  @Column({ type: "int", nullable: true })
  weight: number;

  @Column({ type: "int", nullable: true })
  height: number;

  @Column({ type: "boolean", default: true })
  isActive: boolean;


  @OneToOne(() => AuthEntity, (auth) => auth.patient)
  auth: AuthEntity;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}