import { Injectable } from '@nestjs/common';
import { CreateDoctorSpecialtyDto } from './dto/create-doctor-specialty.dto';
import { UpdateDoctorSpecialtyDto } from './dto/update-doctor-specialty.dto';

@Injectable()
export class DoctorSpecialtyService {
  create(createDoctorSpecialtyDto: CreateDoctorSpecialtyDto) {
    return 'This action adds a new doctorSpecialty';
  }

  findAll() {
    return `This action returns all doctorSpecialty`;
  }

  findOne(id: number) {
    return `This action returns a #${id} doctorSpecialty`;
  }

  update(id: number, updateDoctorSpecialtyDto: UpdateDoctorSpecialtyDto) {
    return `This action updates a #${id} doctorSpecialty`;
  }

  remove(id: number) {
    return `This action removes a #${id} doctorSpecialty`;
  }
}
