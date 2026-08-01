import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PatientEntity } from '../entities/patient.entity';
import { RemovePatientService } from './removePatient.service';
import { FindPatientService } from './findPatient.service';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('remove patient - integration test', () => {
  let removePatientService: RemovePatientService;
  let findPatientService: FindPatientService;
  let patientRepository: Repository<PatientEntity>;

  // Create mock repositories
  const mockPatientRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockFindPatientService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemovePatientService,
        {
          provide: FindPatientService,
          useValue: mockFindPatientService,
        },
        {
          provide: getRepositoryToken(PatientEntity),
          useValue: mockPatientRepository,
        },
      ],
    }).compile();

    removePatientService = module.get<RemovePatientService>(RemovePatientService);
    findPatientService = module.get<FindPatientService>(FindPatientService);
    patientRepository = module.get<Repository<PatientEntity>>(
      getRepositoryToken(PatientEntity),
    );
  });

  it('should remove patient with id', async () => {
    const patientId = '2cb173fa-b806-4883-998c-7f7e62cea6b8';
    const mockPatient = { id: patientId, fullName: 'Test Patient' } as any;

    // Mock findById to return a patient (existence check passes)
    mockFindPatientService.findById.mockResolvedValue(mockPatient);

    // Mock delete to succeed
    mockPatientRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await removePatientService.remove(patientId);

    expect(mockFindPatientService.findById).toHaveBeenCalledWith(patientId);
    expect(mockPatientRepository.delete).toHaveBeenCalledWith({ id: patientId });
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when patient does not exist', async () => {
    const patientId = 'non-existent-id';

    // Mock findById to return null (patient not found)
    mockFindPatientService.findById.mockResolvedValue(null);

    await expect(removePatientService.remove(patientId)).rejects.toThrow(
      NotFoundException,
    );
    expect(mockFindPatientService.findById).toHaveBeenCalledWith(patientId);
    expect(mockPatientRepository.delete).not.toHaveBeenCalled();
  });
});