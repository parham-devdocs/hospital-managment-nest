// auth/services/user.service.ts
import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/auth/types';
import { FindUserService } from './findUser.service';
import { AuthEntity } from 'src/auth/entities/auth.entity';

@Injectable() // ✅ Add Injectable decorator
export class UserService {
    constructor(private readonly findUserService: FindUserService) {}

    // ✅ Check if user exists
    userExists(id: string): Promise<boolean> {
        return this.findUserService.exists(id);
    }

    // ✅ Find all users
    findAll(): Promise<AuthEntity[]> {
        return this.findUserService.findAll();
    }

    // ✅ Find user by email (FIXED: was "Enail")
    findUserByEmail(email: string): Promise<AuthEntity | null> {
        return this.findUserService.findByEmail(email);
    }

    // ✅ Find user by ID
    findUserById(id: string): Promise<AuthEntity | null> {
        return this.findUserService.findById(id);
    }

    // ✅ Find user with relations (FIXED: type and naming)
    findByIdWithRelations(id: string, relations: Record<string,string>): Promise<AuthEntity | null> {
        return this.findUserService.findByIdWithRelations(id, relations);
    }

    // ✅ Find user with patient data
    findWithPatient(id: string): Promise<AuthEntity | null> {
        return this.findUserService.findWithPatient(id);
    }

    // ✅ Find user by role (FIXED: was "Roel")
    findUserByRole(role: UserRole): Promise<AuthEntity[]> {
        return this.findUserService.findByRole(role);
    }

    // ✅ Additional useful methods
    findUserProfile(id: string) {
        return this.findUserService.findUserProfile(id);
    }

    async getUserWithPatient(id: string) {
        const user = await this.findWithPatient(id);
        if (!user) {
            return null;
        }
        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            patient: user.patient || null
        };
    }
}