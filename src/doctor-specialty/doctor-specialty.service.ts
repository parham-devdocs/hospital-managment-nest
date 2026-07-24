import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateDoctorSpecialtyDto } from "./dto/create-doctor-specialty.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { SpecialtyEntity } from "./entities/doctor-specialty.entity";
import { Repository } from "typeorm";
import { UpdateDoctorSpecialtyDto } from "./dto/update-doctor-specialty.dto";


@Injectable()
export class DoctorSpecialtyService{
    constructor(
        @InjectRepository(SpecialtyEntity)
        private doctorSpecialtyEntity: Repository<SpecialtyEntity>,
    ){}

  async  findDoctorSpecialty(id:string){

        const doctorSpecialty=await this.doctorSpecialtyEntity.findOne({where:{id}})
        if (!doctorSpecialty) {
            throw new NotFoundException("no doctor specialty with this id exist")
        }
        return doctorSpecialty
 
     }

 async   createDoctorSpecialty(createDoctorSpecialtyDto:CreateDoctorSpecialtyDto){

       const doctorSpecialty= this.doctorSpecialtyEntity.create({name:createDoctorSpecialtyDto.name})
       return await this.doctorSpecialtyEntity.save(doctorSpecialty);

    }
    async removeDoctorSpecialty(id: string) {
         await this.findDoctorSpecialty(id)
        
        // Then delete
        await this.doctorSpecialtyEntity.delete({ id });
        return { message: "Doctor specialty deleted successfully" };
    }

    async updateDoctorSpecialty(id: string,updateDoctorSpecialty:UpdateDoctorSpecialtyDto) {
        await this.findDoctorSpecialty(id)
       
       // Then delete
       await this.doctorSpecialtyEntity.update({ id },updateDoctorSpecialty);
       return { message: "Doctor specialty deleted successfully" };
   }
}