import { ProfileEntity } from "src/profile/entities/profile.entity";
import { Check, Column, CreateDateColumn ,DeleteDateColumn,Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import {UserRole  } from "src/auth/types";

@Entity("auth")
@Check(`"email" ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'`)
export class AuthEntity {


    @PrimaryGeneratedColumn("uuid")
    id:string

    @Column({type:"varchar",nullable:false})
hashedPassword:string

@Column({type:"varchar",nullable:false,unique:true})
email:string

@Column({type:"enum",enum:UserRole,nullable:false,default:"Patient"})
role:UserRole

@Column({type:"boolean",nullable:false,default:true})
isActive:boolean

@Column({type:"varchar",nullable:true})
refreshToken?:string

@OneToOne(() => ProfileEntity, (profile) => profile.auth, {
    cascade: false,
    nullable: true,
  })
  profile: ProfileEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
deleteAt:Date

    
}
