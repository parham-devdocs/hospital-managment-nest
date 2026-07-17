import { AuthEntity } from "src/auth/entities/auth.entity";
import { Check, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Gender } from "../types";


@Entity("profile")
@Check(`"phoneNumber" ~ '^\\+[1-9]\\d{1,14}$'`)  
export class ProfileEntity {

    @PrimaryGeneratedColumn("uuid")
    id:string
 @OneToOne(() => AuthEntity, (auth) => auth.profile, {
    cascade: false,
    nullable: false,
  })
  @JoinColumn({ name: 'authId' })  
  auth: AuthEntity;

  @Column({ nullable: false })
  authId: string;  

  @Column({type:"varchar",nullable:false})
  address:string

  @Column({type:"varchar",nullable:false})
  phoneNumber:string

  @Column({type:"varchar",nullable:false})
  fullName:string
  @Column({type:"int",nullable:false})
  age:number

  @Column({type:"enum",enum:Gender,nullable:false})
  gender:Gender

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
deleteAt:Date



}
