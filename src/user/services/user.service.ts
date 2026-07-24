// auth/services/user.service.ts
import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/auth/types';
import { FindUserService } from './findUser.service';
import { UserEntity } from '../entities/user.entity';

@Injectable() // ✅ Add Injectable decorator
export class UserService {
    constructor(private readonly findUserService: FindUserService) {}

    // ✅ Check if user exists
    userExists(id: string): Promise<boolean> {
        return this.findUserService.userExists(id);
    }

    // ✅ Find all users
    findAll(): Promise<UserEntity[]> {
        return this.findUserService.findAll();
    }

    // ✅ Find user by email (FIXED: was "Enail")
    findUserByEmail(email: string): Promise<UserEntity | null> {
        return this.findUserService.findByEmail(email);
    }

    // ✅ Find user by ID
    findUserById(id: string): Promise<UserEntity | null> {
        return this.findUserService.findById(id);
    }

    // ✅ Find user with relations (FIXED: type and naming)
    findByIdWithRelations(id: string, relations: Record<string,string>): Promise<UserEntity | null> {
        return this.findUserService.findByIdWithRelations(id, relations);
    }

    // ✅ Find user with patient data
    findWithPatient(id: string): Promise<UserEntity | null> {
        return this.findUserService.findWithPatient(id);
    }

    findWithDoctor(id:string):Promise<UserEntity| null>{
        return this.findWithDoctor(id)
    }

    // ✅ Find user by role (FIXED: was "Roel")
    findUserByRole(role: UserRole): Promise<UserEntity[]> {
        return this.findUserService.findByRole(role);
    }

    // ✅ Additional useful methods
    findUserProfile(id: string) {
        return this.findUserService.findUserProfile(id);
    }


}