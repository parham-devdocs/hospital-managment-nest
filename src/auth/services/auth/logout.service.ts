import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthEntity } from "src/auth/entities/auth.entity";
import { Repository } from "typeorm";
import { JWTService } from "../jwt.service";

@Injectable()
export class LogoutService {
    constructor(
        @InjectRepository(AuthEntity)
        private authRepository: Repository<AuthEntity>,

    ) {}

    async logout(id: string): Promise<{ message: string }> {
        const user = await this.authRepository.findOne({ 
            where: { id } 
        });

        if (!user) {
            throw new Error('User not found');
        }

        const result = await this.authRepository.update(
            { id }, 
            { refreshToken:undefined }
        );

        if (result.affected === 0) {
            throw new Error('Logout failed');
        }

        return { message: 'Logged out successfully' };
    }

    // For logging out of all devices
    async logoutAllDevices(id: string): Promise<{ message: string }> {
        await this.authRepository.update(
            { id }, 
            { refreshToken: undefined }
        );
        
        return { message: 'Logged out from all devices' };
    }
}