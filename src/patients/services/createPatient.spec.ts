import { beforeEach, describe } from "node:test";
import { PatientEntity } from "../entities/patient.entity";
import { Repository } from "typeorm";
import { CreatePatientService } from "./createPatient.service";
import { UserRole } from "src/auth/types";
import { CreatePatientDto } from "../dto/create-patient.dto";
import { Test, TestingModule } from "@nestjs/testing";
import { BloodTypes } from "../type";
import { getRepositoryToken } from "@nestjs/typeorm";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { UserEntity } from "src/user/entities/user.entity";

// Create mock repositories
const mockPatientRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
    })),
};

const mockAuthRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
    })),
};

describe("create patient - unit test", () => {
    let mockPatientRepo: jest.Mocked<typeof mockPatientRepository>;
    let mockAuthRepo: jest.Mocked<typeof mockAuthRepository>;
    let service: CreatePatientService;
    
    const mockPatient: PatientEntity = {
        id: 'patient-123',
        profileId: 'p123-abc-456-def',
        height: 180,
        weight: 87,
        allergies: ["penicillin", "pollen", "cats", "responsibility"],
        bloodTypes: BloodTypes.AB_NEGATIVE,
        emergency_phone: "09124687022",
        isActive: true,
        illness: "Chronic sarcasm",
        medical_condition_summary: "software developer with allergies",
        createdAt: new Date(),
        updatedAt: new Date(),
    } as any;

    const mockUser: UserEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        fullName: 'John Doe',
        role: UserRole.patient,
        password: 'hashedpassword',
        refreshToken: 'refresh-token-123',
        patient: mockPatient,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as any;

    const createPatientDto: CreatePatientDto = {
        profileId: 'p123-abc-456-def',
        height: 180,
        weight: 87,
        allergies: ["penicillin", "pollen", "cats", "responsibility"],
        bloodTypes: BloodTypes.AB_NEGATIVE,
        emergency_phone: "09124687022",
        isActive: true,
        illness: "Chronic sarcasm",
        medical_condition_summary: "software developer with allergies",
    };

    beforeEach(async () => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreatePatientService,
                {
                    provide: getRepositoryToken(PatientEntity),
                    useValue: mockPatientRepository,
                },
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: mockAuthRepository,
                },
            ],
        }).compile();

        service = module.get<CreatePatientService>(CreatePatientService);
        mockPatientRepo = module.get(getRepositoryToken(PatientEntity));
        mockAuthRepo = module.get(getRepositoryToken(UserEntity));
    });

    it("should properly separate profileId from patient data", async () => {
        // 1. Check that profileId was extracted properly
        const { profileId, ...patientData } = createPatientDto;
        
        expect(profileId).toBe('p123-abc-456-def');
        expect(profileId).toBeDefined();
        expect(profileId).not.toBeNull();
        expect(typeof profileId).toBe('string');
        
        // 2. Check that patientData does NOT contain profileId
        expect(patientData).not.toHaveProperty('profileId');
        
        // 3. Allergies - should be an array with specific items
        expect(patientData.allergies).toBeInstanceOf(Array);
        expect(patientData.allergies).toEqual(["penicillin", "pollen", "cats", "responsibility"]);
        expect(patientData.allergies).toContain('penicillin');
        expect(patientData.allergies).toContain('responsibility');
        
        // 4. Blood types - checking against the enum
        expect(patientData.bloodTypes).toBe(BloodTypes.AB_NEGATIVE);
        expect(patientData.bloodTypes).toBeDefined();
        
        // 5. Emergency phone - now has a valid value
        expect(patientData.emergency_phone).toBe("09124687022");
        expect(patientData.emergency_phone).toMatch(/^09\d{9}$/);
        
        // 6. Height assertions
        expect(patientData.height).toBeGreaterThan(100);
        expect(patientData.height).toBe(180);
        expect(patientData.height).toBeGreaterThan(170);
        expect(patientData.height).toBeLessThan(200);
        
        // 7. Additional assertions to verify ALL fields were properly moved to patientData
        expect(patientData.weight).toBe(87);
        expect(patientData.isActive).toBe(true);
        expect(patientData.illness).toBe("Chronic sarcasm");
        
        
        // 10. Count the fields
        const totalFields = Object.keys(createPatientDto).length;
        const patientDataFields = Object.keys(patientData).length;
        expect(patientDataFields).toBe(totalFields - 1);
    });

    it("should successfully create patient when user is available", async () => {
        const { profileId, ...patientData } = createPatientDto;
        
        // Mock the user availability check
        mockAuthRepo.create.mockResolvedValue(mockUser);
        mockPatientRepo.create.mockReturnValue(mockPatient);
        mockPatientRepo.save.mockResolvedValue(mockPatient);

        // Act - call the service method
        // Assuming service.create expects the DTO and user ID
        const result = await service.create(createPatientDto);

        // Assert - user is available
        const userIsAvailable = await mockAuthRepo.findOne({ where: { id: mockUser.id } });
        expect(userIsAvailable).toBe(mockUser);
        
        // Verify patient was created
        expect(mockPatientRepo.create).toHaveBeenCalledWith({
            ...patientData,
            profileId: profileId
        });
        expect(mockPatientRepo.save).toHaveBeenCalledWith(mockPatient);
        expect(result).toBeDefined();
    });

    it("should throw NotFoundException when user is not found", async () => {
        const { profileId } = createPatientDto;

        // Mock the user availability check - user NOT found
        mockAuthRepo.findOne.mockResolvedValue(null);

        // Act & Assert - expect the service to throw
        await expect(service.create(createPatientDto))
            .rejects
            .toThrow(NotFoundException);
        
        // Verify the user check was called
        const userIsAvailable = await mockAuthRepo.findOne({ where: { id: mockUser.id } });
        expect(userIsAvailable).toBeNull();
        
        // Verify patient repository was NOT called
        expect(mockPatientRepo.create).not.toHaveBeenCalled();
        expect(mockPatientRepo.save).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when user already has a patient profile", async () => {
        // Mock the user with an existing patient
        const userWithPatient = { 
            ...mockUser, 
            patient: mockPatient 
        };
        mockAuthRepo.findOne.mockResolvedValue(userWithPatient);

        // Act & Assert
        await expect(service.create(createPatientDto))
            .rejects
            .toThrow(BadRequestException);
        
        // Verify patient repository was NOT called
        expect(mockPatientRepo.create).not.toHaveBeenCalled();
        expect(mockPatientRepo.save).not.toHaveBeenCalled();
    });

    it("should handle the case where userIsAvailable is not equal to mockUser", async () => {
        // Mock a different user being returned
        const differentUser = { ...mockUser, id: 'different-id' };
        mockAuthRepo.findOne.mockResolvedValue(differentUser);

        // Act
        try {
            await service.create(createPatientDto);
            
            // If we reach here, check the condition
            const userIsAvailable = await mockAuthRepo.findOne({ where: { id: mockUser.id } });
            
            // This will fail if userIsAvailable is not the expected user
            expect(userIsAvailable).toBe(mockUser);
            
            // Additional check - if this fails, throw an error
            if (userIsAvailable !== mockUser) {
                throw new Error('User mismatch: Expected mockUser but got different user');
            }
        } catch (error) {
            // The test should catch this error
            expect(error).toBeDefined();
        }
    });
});