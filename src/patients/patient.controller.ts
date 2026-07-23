// patients/patient.controller.ts
import { 
  Controller, 
  Post, 
  Body, 
  Res, 
  ConflictException,
  HttpStatus,
  NotFoundException,
  Get,
  Param,
  Delete
} from '@nestjs/common';
import {type Response } from 'express';
import { CreatePatientDto } from './dto/create-patient.dto';
import { CreatePatientService } from './services/createPatient.service';
import { FindUserService } from 'src/user/services/findUser.service';
import { RemovePatientService } from './services/removePatient.service';

@Controller('patient')

export class PatientController {
  constructor(
      private readonly createPatientService: CreatePatientService,
      private readonly findPatientService:FindUserService,
      private readonly removePatientService:RemovePatientService

  ) {}

  @Post()
  async create(
      @Body() createPatientDto: CreatePatientDto,
      @Res() res: Response,
  ): Promise<Response> {
      try {
          // ✅ Add await
          const response = await this.createPatientService.create(createPatientDto);

          return res.status(HttpStatus.CREATED).json({
              success: true,
              message: 'Patient profile created successfully',
              data: response 
          });
      } catch (error) {
          if (error instanceof ConflictException) {
              return res.status(HttpStatus.CONFLICT).json({
                  success: false,
                  message: error.message,
              });
          }
          if (error instanceof NotFoundException) {
              return res.status(HttpStatus.NOT_FOUND).json({
                  success: false,
                  message: error.message,
              });
          }
          throw error;
      }
  }

  @Get("/:id")
  async findPatient(@Param("id") id:string){
return this.findPatientService.findById(id)
  }

  @Delete("/:id")
  async  removePatient(@Param("id") id:string) {
    return this.removePatientService.remove(id)
  }
}