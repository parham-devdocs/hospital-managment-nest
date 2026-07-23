// patients/services/create-patient.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientEntity } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UserService } from '../../user/services/user.service';
import { UserEntity } from 'src/user/entities/user.entity';

@Injectable()
export class CreatePatientService {
    constructor(
        @InjectRepository(PatientEntity)
        private patientRepo: Repository<PatientEntity>,
        
        @InjectRepository(UserEntity) // ✅ Add Auth repository
        private authRepo: Repository<UserEntity>,
        
        private userService: UserService,
    ) {}

    async create(createPatientDto: CreatePatientDto): Promise<PatientEntity> {
        const { profileId, ...patientData } = createPatientDto;

        // 1. Check if user exists
        const user = await this.userService.findUserById(profileId)

        if (!user) {
            throw new NotFoundException(`User with ID ${profileId} not found`);
        }

        // 2. Check if patient already exists
        const existingPatient = await this.patientRepo.findOne({
            where: { id:profileId }
        });

        if (existingPatient) {
            throw new ConflictException('Patient profile already exists for this user');
        }

        // 3. Create new patient entity
        const patient = new PatientEntity();
        patient.id = profileId; // ✅ Correct: profileId, not id
        patient.illness = patientData.illness;
        patient.medical_condition_summary = patientData.medical_condition_summary;
        patient.allergies = patientData.allergies;
        patient.bloodType = patientData.bloodTypes; // ✅ Match entity field name
        patient.emergencyPhone = patientData.emergency_phone; // ✅ Match entity field name
        patient.weight = patientData.weight;
        patient.height = patientData.height;
        patient.isActive = patientData.isActive !== undefined ? patientData.isActive : true;

        // 4. Save patient
        const savedPatient = await this.patientRepo.save(patient);

        // 5. Update user with patient reference (optional)
        await this.authRepo.update(
            { id: profileId },
            { patient: savedPatient }
        );

        return savedPatient;
    }
}