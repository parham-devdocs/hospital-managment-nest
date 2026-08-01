import { Injectable, NotFoundException } from "@nestjs/common";
import { PatientEntity } from "../entities/patient.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FindPatientService } from "./findPatient.service";

@Injectable()
export class RemovePatientService {
    constructor(
        @InjectRepository(PatientEntity)
        private readonly patientRepository: Repository<PatientEntity>,
        private readonly findPatientService: FindPatientService
    ) {}

    async remove(id: string) {
        const isPatientExisting = await this.findPatientService.findById(id);
        
        if (!isPatientExisting) {
            throw new NotFoundException("Patient with this id does not exist");
        }

        await this.patientRepository.delete({ id });

        return {
            statusCode: 200,
            message: "Patient deleted successfully",
            data: {
                id: id,
                deletedAt: new Date().toISOString()
            }
        };
    }
}