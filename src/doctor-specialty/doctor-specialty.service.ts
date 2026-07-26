import { BadRequestException, Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { CreateDoctorSpecialtyDto } from "./dto/create-doctor-specialty.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { SpecialtyEntity } from "./entities/doctor-specialty.entity";
import { Repository } from "typeorm";
import { UpdateDoctorSpecialtyDto } from "./dto/update-doctor-specialty.dto";
import { AddSpecialtyToDoctorDto } from "./dto/add-specialty-to-doctor.dto";
import { DoctorEntity } from "src/doctor/entities/doctor.entity";

@Injectable()
export class DoctorSpecialtyService {
    constructor(
        @InjectRepository(SpecialtyEntity)
        private doctorSpecialtyRepository: Repository<SpecialtyEntity>,
        @InjectRepository(DoctorEntity)
        private doctorRepository: Repository<DoctorEntity>
    ) {}

    // Find a single specialty
    async findDoctorSpecialty(id: string) {
        const doctorSpecialty = await this.doctorSpecialtyRepository.findOne({
            where: { id }
        });
        
        if (!doctorSpecialty) {
            return null;
        }
        return doctorSpecialty;
    }

    // Create a new specialty (standalone)
    async createDoctorSpecialty(createDoctorSpecialtyDto: CreateDoctorSpecialtyDto) {
        const doctorSpecialty = this.doctorSpecialtyRepository.create({
            name: createDoctorSpecialtyDto.name
        });
        return await this.doctorSpecialtyRepository.save(doctorSpecialty);
    }

    // Remove a specialty
    async removeDoctorSpecialty(id: string) {
        await this.findDoctorSpecialty(id);
        await this.doctorSpecialtyRepository.delete({ id });
        return { message: "Doctor specialty deleted successfully" };
    }

    // Update a specialty
    async updateDoctorSpecialty(id: string, updateDoctorSpecialty: UpdateDoctorSpecialtyDto) {
        await this.findDoctorSpecialty(id);
        await this.doctorSpecialtyRepository.update({ id }, updateDoctorSpecialty);
        return { message: "Doctor specialty updated successfully" };
    }

    // Add EXISTING specialty to a doctor (your new design)
    async addSpecialtyToDoctor(
        addSpecialtyToDoctorDto: AddSpecialtyToDoctorDto,
    ) {
        try {
            // 1. Check if doctor exists
            const doctor = await this.doctorRepository.findOne({
                where: { id: addSpecialtyToDoctorDto.doctorId },
                relations: { specialties: true }
            });

            if (!doctor) {
                throw new NotFoundException(`Doctor with ID ${addSpecialtyToDoctorDto.doctorId} not found`);
            }

            // 2. Check if specialty exists
            const doctorSpecialty = await this.findDoctorSpecialty(
                addSpecialtyToDoctorDto.specialtyId
            );

            if (!doctorSpecialty) {
                throw new NotFoundException(
                    `Specialty with ID ${addSpecialtyToDoctorDto.specialtyId} does not exist`
                );
            }

            // 3. Check if doctor already has this specialty (prevent duplicates)
            if (!doctor.specialties) {
                doctor.specialties = [];
            }

            const alreadyHasSpecialty = doctor.specialties.some(
                s => s.id === doctorSpecialty.id
            );

            if (alreadyHasSpecialty) {
                throw new ConflictException(
                    `Doctor already has the specialty: ${doctorSpecialty.name}`
                );
            }

            // 4. Add the specialty to the doctor
            doctor.specialties.push(doctorSpecialty);
            await this.doctorRepository.save(doctor);

            return {
                success: true,
                status: 200,
                message: 'Specialty added to doctor successfully',
                data: {
                    specialty: doctorSpecialty,
                    doctorId: doctor.id,
                    totalSpecialties: doctor.specialties.length,
                },
            };
        } catch (error) {
            // Re-throw known exceptions
            if (error instanceof NotFoundException || 
                error instanceof ConflictException) {
                throw error;
            }
            
            throw new BadRequestException(
                `Failed to add specialty to doctor: ${error.message}`
            );
        }
    }

    // OPTIONAL: Create AND add specialty to doctor (combines both)
    async createAndAddSpecialtyToDoctor(
        createSpecialtyDto: CreateDoctorSpecialtyDto,
        doctorId: string
    ) {
        try {
            // 1. Check if doctor exists
            const doctor = await this.doctorRepository.findOne({
                where: { id: doctorId },
                relations: { specialties: true }
            });

            if (!doctor) {
                throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
            }

            // 2. Create the new specialty
            const newSpecialty = await this.createDoctorSpecialty(createSpecialtyDto);

            // 3. Initialize specialties if null
            if (!doctor.specialties) {
                doctor.specialties = [];
            }

            // 4. Add to doctor
            doctor.specialties.push(newSpecialty);
            await this.doctorRepository.save(doctor);

            return {
                success: true,
                status: 201,
                message: 'Specialty created and added to doctor successfully',
                data: {
                    specialty: newSpecialty,
                    doctorId: doctor.id,
                    totalSpecialties: doctor.specialties.length,
                },
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(
                `Failed to create and add specialty: ${error.message}`
            );
        }
    }

    // OPTIONAL: Remove specialty from doctor
    async removeSpecialtyFromDoctor(
        doctorId: string,
        specialtyId: string
    ) {
        try {
            const doctor = await this.doctorRepository.findOne({
                where: { id: doctorId },
                relations: { specialties: true }
            });

            if (!doctor) {
                throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
            }

            if (!doctor.specialties || doctor.specialties.length === 0) {
                throw new BadRequestException('Doctor has no specialties to remove');
            }

            const hasSpecialty = doctor.specialties.some(s => s.id === specialtyId);
            if (!hasSpecialty) {
                throw new NotFoundException(
                    `Doctor does not have specialty with ID ${specialtyId}`
                );
            }

            doctor.specialties = doctor.specialties.filter(s => s.id !== specialtyId);
            await this.doctorRepository.save(doctor);

            return {
                success: true,
                status: 200,
                message: 'Specialty removed from doctor successfully',
                data: {
                    doctorId: doctor.id,
                    removedSpecialtyId: specialtyId,
                    remainingSpecialties: doctor.specialties.length,
                },
            };
        } catch (error) {
            if (error instanceof NotFoundException || 
                error instanceof BadRequestException) {
                throw error;
            }
            throw new BadRequestException(
                `Failed to remove specialty: ${error.message}`
            );
        }
    }

    // OPTIONAL: Get all specialties for a doctor
    async getDoctorSpecialties(doctorId: string) {
        try {
            const doctor = await this.doctorRepository.findOne({
                where: { id: doctorId },
                relations: { specialties: true }
            });

            if (!doctor) {
                throw new NotFoundException(`Doctor with ID ${doctorId} not found`);
            }

            return {
                success: true,
                status: 200,
                data: {
                    doctorId: doctor.id,
                    specialties: doctor.specialties || [],
                    total: doctor.specialties?.length || 0,
                },
            };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException(
                `Failed to get doctor specialties: ${error.message}`
            );
        }
    }
}