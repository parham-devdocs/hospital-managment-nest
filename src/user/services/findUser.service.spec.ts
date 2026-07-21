// auth/services/find-user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindUserService } from 'src/user/services/findUser.service';
import { AuthEntity } from 'src/auth/entities/auth.entity';
import { UserRole } from 'src/auth/types';


describe('FindUserService - Unit Tests', () => {
  let service: FindUserService;
  let mockRepo: jest.Mocked<Repository<AuthEntity>>;

  // Mock data
  const mockUser: AuthEntity = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com',
    fullName: 'John Doe',
    role: UserRole.patient,
    password: 'hashedpassword',
    refreshToken: 'refresh-token-123',
    patient: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any

  beforeEach(async () => {
    // Create mock repository
    mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindUserService,
        {
          provide: getRepositoryToken(AuthEntity),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<FindUserService>(FindUserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent-id');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' }
      });
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user when email exists', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('notfound@example.com');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { email: 'notfound@example.com' }
      });
      expect(result).toBeNull();
    });
  });

  describe('findByRefreshToken', () => {
    it('should return user by refresh token', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByRefreshToken('refresh-token-123');

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { refreshToken: 'refresh-token-123' }
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const users = [mockUser, { ...mockUser, id: '456' }];
      mockRepo.find.mockResolvedValue(users);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual(users);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users', async () => {
      mockRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(mockRepo.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findByRole', () => {
    it('should return users by role', async () => {
      const doctors = [
        mockUser,
        { ...mockUser, id: '456', role: UserRole.doctor }
      ];
      mockRepo.find.mockResolvedValue(doctors);

      const result = await service.findByRole(UserRole.doctor);

      expect(mockRepo.find).toHaveBeenCalledWith({
        where: { role: UserRole.doctor }
      });
      expect(result).toEqual(doctors);
    });
  });

  describe('userExists', () => {
    it('should return true when user exists', async () => {
      mockRepo.count.mockResolvedValue(1);

      const result = await service.userExists(mockUser.id);

      expect(mockRepo.count).toHaveBeenCalledWith({
        where: { id: mockUser.id }
      });
      expect(result).toBe(true);
    });

    it('should return false when user does not exist', async () => {
      mockRepo.count.mockResolvedValue(0);

      const result = await service.userExists('non-existent-id');

      expect(mockRepo.count).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' }
      });
      expect(result).toBe(false);
    });
  });

  describe('findWithPatient', () => {
    it('should return user with patient relation', async () => {
      const userWithPatient = {
        ...mockUser,
        patient: { id: 'patient-1', name: 'Patient Name' }
      };
      mockRepo.findOne.mockResolvedValue(userWithPatient as any);

      const result = await service.findWithPatient(mockUser.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: { patient: true }
      });
      expect(result).toEqual(userWithPatient);
      expect(result?.patient).toBeDefined();
    });
  });

  describe('findUserProfile', () => {
    it('should return formatted user profile', async () => {
      const userWithPatient = {
        ...mockUser,
        patient: { id: 'patient-1', name: 'Patient Name' }
      };
      mockRepo.findOne.mockResolvedValue(userWithPatient as any);

      const result = await service.findUserProfile(mockUser.id);

      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: { patient: true }
      });
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
        patient: userWithPatient.patient
      });
    });

    it('should return null when user not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.findUserProfile('non-existent-id');

      expect(result).toBeNull();
    });

    it('should return profile with patient null when no patient relation', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findUserProfile(mockUser.id);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        fullName: mockUser.fullName,
        role: mockUser.role,
        patient: null
      });
    });
  });
});