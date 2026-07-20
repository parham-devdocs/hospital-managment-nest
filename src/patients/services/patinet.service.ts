import { CreatePatientDto } from "../dto/create-patient.dto";
import { CreatePatinet } from "./createPatient.service";


export class PatientService{
    constructor(
        private readonly createPatientService:CreatePatinet
    ){}

    createPatient(createPatientDto:CreatePatientDto){
        return this.createPatientService.create(createPatientDto)
    }
}