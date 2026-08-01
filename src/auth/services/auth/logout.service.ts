import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class LogoutService {
    constructor(
        @InjectRepository(UserEntity)
        private authRepository: Repository<UserEntity>,

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