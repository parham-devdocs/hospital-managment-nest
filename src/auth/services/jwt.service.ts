// src/auth/services/jwt.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JWTService {
  constructor(
    private readonly jwt: NestJwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateToken(userId: string, email: string): Promise<string> {
    const payload = { 
      sub: userId, 
      email: email,
    };
    
    return this.jwt.signAsync(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION') || '1d',
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  async generateRefreshToken(userId: string, email: string): Promise<string> {
    const payload = { 
      sub: userId, 
      email: email,
    };
    
    return this.jwt.signAsync(payload, {
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION') || '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
    });
  }

  async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async verifyRefreshToken(token: string): Promise<any> {
    try {
      return await this.jwt.verifyAsync(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET') || this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  decodeToken(token: string): any {
    return this.jwt.decode(token);
  }
}