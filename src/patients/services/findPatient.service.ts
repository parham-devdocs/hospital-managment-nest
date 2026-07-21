// patients/services/patient.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { PatientEntity } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { BloodTypes } from '../type';

@Injectable()
export class FindPatientService {
    constructor(
        @InjectRepository(PatientEntity)
        private patientRepo: Repository<PatientEntity>,
    ) {}

    // ============ PRIMARY FIND METHODS ============
    
    async findById(id: string): Promise<PatientEntity> {
        const patient = await this.patientRepo.findOne({ where: { id } });
        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }

  

    async findByUserId(userId: string): Promise<PatientEntity> {
        const patient = await this.patientRepo.findOne({ 
            where: { auth:{id:userId} } 
        });
        if (!patient) {
            throw new NotFoundException(`Patient for user ID ${userId} not found`);
        }
        return patient;
    }

    // ============ ADVANCED FIND METHODS ============
    
    async findAll(options?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
    }): Promise<{ data: PatientEntity[]; total: number }> {
        const page = options?.page || 1;
        const limit = options?.limit || 10;
        const skip = (page - 1) * limit;

        const [data, total] = await this.patientRepo.findAndCount({
            skip,
            take: limit,
            order: { 
                [options?.sortBy || 'createdAt']: options?.sortOrder || 'DESC' 
            },
        });

        return { data, total };
    }

    // ============ FIND BY MEDICAL CONDITIONS ============
    
    async findByAllergies(allergies: string[]): Promise<PatientEntity[]> {
        // Find patients with any of these allergies
        return await this.patientRepo
            .createQueryBuilder('patient')
            .where('patient.allergies && ARRAY[:...allergies]', { allergies })
            .getMany();
    }

    async findByMedicalCondition(condition: string): Promise<PatientEntity[]> {
        return await this.patientRepo.find({
            where: { 
                medical_condition_summary: Like(`%${condition}%`) 
            }
        });
    }

    async findByIllness(illness: string): Promise<PatientEntity[]> {
        return await this.patientRepo.find({
            where: { illness: Like(`%${illness}%`) }
        });
    }

    // ============ FIND BY DEMOGRAPHICS ============
    
    async findByBloodType(bloodType: BloodTypes): Promise<PatientEntity[]> {
        return await this.patientRepo.find({
            where: { bloodType: bloodType }
        });
    }

    async findByHeightRange(min: number, max: number): Promise<PatientEntity[]> {
        return await this.patientRepo.find({
            where: { 
                height: Between(min, max) 
            }
        });
    }

    async findByWeightRange(min: number, max: number): Promise<PatientEntity[]> {
        return await this.patientRepo.find({
            where: { 
                weight: Between(min, max) 
            }
        });
    }

    // ============ FIND WITH RELATIONSHIPS ============
    
    async findWithUser(id: string): Promise<PatientEntity> {
        const patient = await this.patientRepo.findOne({
            where: { id },
            relations: {auth:true}
        });
        if (!patient) {
            throw new NotFoundException(`Patient with ID ${id} not found`);
        }
        return patient;
    }


    // ============ COMPLEX SEARCH ============
    
    async search(filters: {
        name?: string;
        allergies?: string[];
        bloodType?: string;
        isActive?: boolean;
        minHeight?: number;
        maxHeight?: number;
        minWeight?: number;
        maxWeight?: number;
    }): Promise<PatientEntity[]> {
        const query = this.patientRepo.createQueryBuilder('patient');

        if (filters.allergies && filters.allergies.length > 0) {
            query.andWhere('patient.allergies && ARRAY[:...allergies]', { 
                allergies: filters.allergies 
            });
        }

        if (filters.bloodType) {
            query.andWhere('patient.bloodTypes = :bloodType', { 
                bloodType: filters.bloodType 
            });
        }

        if (filters.isActive !== undefined) {
            query.andWhere('patient.isActive = :isActive', { 
                isActive: filters.isActive 
            });
        }

        if (filters.minHeight) {
            query.andWhere('patient.height >= :minHeight', { 
                minHeight: filters.minHeight 
            });
        }

        if (filters.maxHeight) {
            query.andWhere('patient.height <= :maxHeight', { 
                maxHeight: filters.maxHeight 
            });
        }

        if (filters.minWeight) {
            query.andWhere('patient.weight >= :minWeight', { 
                minWeight: filters.minWeight 
            });
        }

        if (filters.maxWeight) {
            query.andWhere('patient.weight <= :maxWeight', { 
                maxWeight: filters.maxWeight 
            });
        }

        return await query.getMany();
    }

    // ============ BULK FIND OPERATIONS ============
    
    async findByIds(ids: string[]): Promise<PatientEntity[]> {
        return await this.patientRepo.find({
            where: { id: In(ids) }
        });
    }

    async findActivePatients(): Promise<PatientEntity[]> {
        return await this.patientRepo.find({
            where: { isActive: true }
        });
    }

    async findInactivePatients(): Promise<PatientEntity[]> {
        return await this.patientRepo.find({
            where: { isActive: false }
        });
    }
}