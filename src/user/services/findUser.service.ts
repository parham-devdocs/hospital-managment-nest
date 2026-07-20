// auth/services/find-user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { UserRole } from 'src/auth/types';
import { Repository } from 'typeorm';

@Injectable() // ✅ Add Injectable decorator
export class FindUserService {
    constructor(
        @InjectRepository(AuthEntity) // ✅ Decorator in constructor parameters
        private authRepo: Repository<AuthEntity>, // ✅ Correct naming
    ) {}

    // ✅ Find user by ID
    async findById(id: string): Promise<AuthEntity | null> {
        return await this.authRepo.findOne({
            where: { id }
        });
    }

    // ✅ Find user by email
    async findByEmail(email: string): Promise<AuthEntity | null> {
        return await this.authRepo.findOne({
            where: { email }
        });
    }

    // ✅ Find user with relations
    async findByIdWithRelations(id: string, relations: Record<string,string> = {}): Promise<AuthEntity | null> {
        return await this.authRepo.findOne({
            where: { id },
            relations:{...relations} 
        });
    }

    // ✅ Find user by refresh token
    async findByRefreshToken(refreshToken: string): Promise<AuthEntity | null> {
        return await this.authRepo.findOne({
            where: { refreshToken }
        });
    }

    // ✅ Find all users
    async findAll(): Promise<AuthEntity[]> {
        return await this.authRepo.find();
    }

    // ✅ Find users by role
    async findByRole(role: UserRole): Promise<AuthEntity[]> {
        return await this.authRepo.find({
            where: { role }
        });
    }

    // ✅ Check if user exists
    async exists(id: string): Promise<boolean> {
        const count = await this.authRepo.count({
            where: { id }
        });
        return count > 0;
    }

    // ✅ Find user with patient data
    async findWithPatient(id:string): Promise<AuthEntity | null> {
        return await this.authRepo.findOne({
            where: { id },
            relations: {patient:true}
        });
    }

    // ✅ Find user and return formatted response
    async findUserProfile(id: string) {
        const user = await this.authRepo.findOne({
            where: { id },
            relations:{patient:true}
        });

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