import { Test, TestingModule } from '@nestjs/testing';
import { DoctorSpecialtyService } from './doctor-specialty.service';

describe('DoctorSpecialtyService', () => {
  let service: DoctorSpecialtyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoctorSpecialtyService],
    }).compile();

    service = module.get<DoctorSpecialtyService>(DoctorSpecialtyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
