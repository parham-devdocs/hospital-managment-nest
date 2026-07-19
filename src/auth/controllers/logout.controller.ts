// auth.controller.ts
import { Controller, Post, Body, Res, Req, Request } from '@nestjs/common';
import {type Response } from 'express';
import { AuthService } from '../services/auth/auth.service';
import { LoginServiceResponse } from '../types';
import { LoginAuthDto } from '../dto/login-auth.dto';
import { JWTService } from '../services/jwt.service';

@Controller('auth')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @Post('logout')
  async register(
    @Res() res: Response,
    @Request() req
  ): Promise<Response> {
    const userId = req.user.id; 
     await this.authService.logout(userId);
    

    // ✅ Set cookie
    res.clearCookie('access_token');

    // ✅ Return response
    return res.status(201).json({
      success: true,
      message: 'Logout successful'
    });
  }
}
