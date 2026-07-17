// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import {JwtService} from '@nestjs/jwt'
@Injectable()
export class JWTService {
constructor(private readonly jwt:JwtService){}
    async generateToken(userId:string,email:string): Promise<string> {
        const payload = { sub: userId, email: email };
        return this.jwt.signAsync(payload, {
          expiresIn: '1d',
          secret: process.env.JWT_SECRET,
        })
  }

  async verifyToken(token:string): Promise<any> {
    try {
        return this.jwt.verifyAsync(token,{secret:process.env.JWT_SECRET})
    } catch (error) {
        throw new UnauthorizedException("invalid token")
    }

  }
}