// auth.controller.ts
import { Controller, Post, Body, Res, Req, Request, ConflictException } from '@nestjs/common';
import {type Response } from 'express';
import { CreatePatientDto } from '../dto/create-patient.dto';
import {PatientService} from '../services/patinet.service'
import { Repository } from 'typeorm';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('patient')
export class LoginController {
  constructor(private readonly patientService: PatientService,
    @InjectRepository(AuthEntity)
    private authRepo: Repository<AuthEntity>, 
  ) {}

  @Post()
  async create(
    @Body() createPatientDto:CreatePatientDto,
    @Res() res: Response,
  ): Promise<Response> {
    const patientAlreadyExists=await this.authRepo.findOne({where:{id:createPatientDto.profileId}})
    if (patientAlreadyExists) {
        throw new ConflictException("patient already exists")
    }
   const response=   this.patientService.createPatient(createPatientDto)
    


    return res.status(201).json({
      success: true,
      message: 'patient created successfully'
    });
  }
}
