// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from '../entities/auth.entity';
import { SignUpAuthDto } from '../dto/signup-auth.dto';
import { HashPassword } from './hashPassword.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService, 
    private hashPassword:HashPassword
  ) {}

  async register(signUpAuthDto: SignUpAuthDto) {
    // 1. Hash the password
    this.hashPassword.hashPassword
    // 2. Create user with hashed password
    const newUser = this.authRepository.create({
      email: signUpAuthDto.email,
      password: hashedPassword, // ✅ Store hashed password, not plain text
    });
    
    // 3. Save user to database
    const savedUser = await this.authRepository.save(newUser); // ✅ Add 'await'
    
    // 4. Generate JWT token
    const payload = { 
      sub: savedUser.id, 
      email: savedUser.email 
    };
    const token = await this.jwtService.signAsync(payload); // ✅ Use signAsync or sign
    
    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
      },
      token: token,
    };
  }
}