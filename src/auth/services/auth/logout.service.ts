// logout.service.ts
import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class LogoutService {
    constructor(
        @InjectRepository(UserEntity)
        private authRepository: Repository<UserEntity>,
        private readonly logger: LoggerService, // Inject LoggerService
    ) {}

    async logout(id: string): Promise<{ message: string }> {
        this.logger.info('Logout attempt', { 
            userId: id,
            method: 'logout',
            timestamp: new Date().toISOString()
        });

        // Validate input
        if (!id) {
            this.logger.warn('Logout failed - user ID is missing');
            throw new BadRequestException('User ID is required');
        }

        try {
            this.logger.debug('Finding user for logout', { userId: id });
            
            const user = await this.authRepository.findOne({ 
                where: { id } 
            });

            if (!user) {
                this.logger.warn('Logout failed - user not found', { userId: id });
                throw new NotFoundException('User not found');
            }

            this.logger.debug('User found, clearing refresh token', { 
                userId: id,
                hasRefreshToken: !!user.refreshToken 
            });

            const result = await this.authRepository.update(
                { id }, 
                { refreshToken: "" } // Use null instead of undefined for better database handling
            );

            if (result.affected === 0) {
                this.logger.error('Logout failed - update operation affected 0 rows', null, {
                    userId: id,
                    affected: result.affected
                });
                throw new Error('Logout failed');
            }

            this.logger.info('User logged out successfully', { 
                userId: id,
                affectedRows: result.affected,
                timestamp: new Date().toISOString()
            });

            return { message: 'Logged out successfully' };
        } catch (error) {
            this.logger.error(
                'Logout operation failed',
                error.stack,
                { 
                    userId: id,
                    errorType: error.constructor.name,
                    errorMessage: error.message 
                }
            );
            throw error;
        }
    }

    // For logging out of all devices
    async logoutAllDevices(id: string): Promise<{ message: string }> {
        this.logger.info('Logout all devices attempt', { 
            userId: id,
            method: 'logoutAllDevices',
            timestamp: new Date().toISOString()
        });

        // Validate input
        if (!id) {
            this.logger.warn('Logout all devices failed - user ID is missing');
            throw new BadRequestException('User ID is required');
        }

        try {
            this.logger.debug('Checking if user exists before logout all devices', { userId: id });

            // First verify the user exists
            const user = await this.authRepository.findOne({ 
                where: { id } 
            });

            if (!user) {
                this.logger.warn('Logout all devices failed - user not found', { userId: id });
                throw new NotFoundException('User not found');
            }

            this.logger.debug('User found, clearing refresh token for all sessions', { 
                userId: id,
                currentRefreshToken: !!user.refreshToken 
            });

            const result = await this.authRepository.update(
                { id }, 
                { refreshToken: "" } // Clear refresh token
            );

            if (result.affected === 0) {
                this.logger.error('Logout all devices failed - update operation affected 0 rows', null, {
                    userId: id,
                    affected: result.affected
                });
                throw new Error('Logout from all devices failed');
            }

            this.logger.info('User logged out from all devices successfully', { 
                userId: id,
                affectedRows: result.affected,
                timestamp: new Date().toISOString()
            });

            return { message: 'Logged out from all devices' };
        } catch (error) {
            this.logger.error(
                'Logout all devices operation failed',
                error.stack,
                { 
                    userId: id,
                    errorType: error.constructor.name,
                    errorMessage: error.message 
                }
            );
            throw error;
        }
    }
}