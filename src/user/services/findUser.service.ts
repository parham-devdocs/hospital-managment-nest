// auth/services/find-user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'src/auth/types';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class FindUserService {
    constructor(
        @InjectRepository(UserEntity)
        private authRepo: Repository<UserEntity>,
    ) {}

    // ✅ Find user by ID - returns null if not found
    async findById(id: string): Promise<UserEntity | null> {
        return await this.authRepo.findOne({
            where: { id }
        });
    }

    // ✅ Find user by email - returns null if not found
    async findByEmail(email: string): Promise<UserEntity | null> {
        return await this.authRepo.findOne({
            where: { email }
        });
    }

    // ✅ Find user with relations - returns null if not found
    async findByIdWithRelations(id: string, relations: Record<string, any> = {}): Promise<UserEntity | null> {
        return await this.authRepo.findOne({
            where: { id },
            relations: { ...relations }
        });
    }

    // ✅ Find user by refresh token - returns null if not found
    async findByRefreshToken(refreshToken: string): Promise<UserEntity | null> {
        return await this.authRepo.findOne({
            where: { refreshToken }
        });
    }

    // ✅ Find all users - returns empty array if none exist
    async findAll(): Promise<UserEntity[]> {
        return await this.authRepo.find();
    }

    // ✅ Find users by role - returns empty array if none found
    async findByRole(role: UserRole): Promise<UserEntity[]> {
        return await this.authRepo.find({
            where: { role }
        });
    }

    // ✅ Check if user exists - returns boolean
    async userExists(id: string): Promise<boolean> {
        const count = await this.authRepo.count({
            where: { id }
        });
        return count > 0;
    }

    // ✅ Find user with patient data - returns null if user or patient not found
    async findWithPatient(id: string): Promise<UserEntity | null> {
        const userWithPatient = await this.authRepo.findOne({
            where: { id },
            relations: { patient: true }
        });
        
        // Returns null if user doesn't exist OR has no patient
        if (!userWithPatient?.patient) {
            return null;
        }
        
        return userWithPatient;
    }

    // ✅ Find user with doctor data - returns null if user or doctor not found
    async findWithDoctor(id: string): Promise<UserEntity | null> {
        const userWithDoctor = await this.authRepo.findOne({
            where: { id },
            relations: { doctor: true }
        });
        
        // Returns null if user doesn't exist OR has no doctor
        if (!userWithDoctor?.doctor) {
            return null;
        }
        
        return userWithDoctor;
    }

    // ✅ Find user with both profiles - returns null if user not found
    async findWithBothProfiles(id: string): Promise<UserEntity | null> {
        return await this.authRepo.findOne({
            where: { id },
            relations: { 
                patient: true,
                doctor: true 
            }
        });
    }

    // ✅ Find user profile - returns null if user not found
    async findUserProfile(id: string): Promise<{
        id: string;
        email: string;
        fullName: string;
        role: UserRole;
        patient: any | null;
        doctor: any | null;
    } | null> {
        const user = await this.authRepo.findOne({
            where: { id },
            relations: { 
                patient: true,
                doctor: true 
            }
        });

        if (!user) {
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            patient: user.patient || null,
            doctor: user.doctor || null
        };
    }

    // ✅ Find user with specific relation - returns null if not found
    async findWithRelation<T>(
        id: string, 
        relationName: string,
        relationCheck?: (user: UserEntity) => boolean
    ): Promise<UserEntity | null> {
        const user = await this.authRepo.findOne({
            where: { id },
            relations: { [relationName]: true }
        });
        
        if (!user) {
            return null;
        }
        
        // Optional check for the relation
        if (relationCheck && !relationCheck(user)) {
            return null;
        }
        
        return user;
    }
}