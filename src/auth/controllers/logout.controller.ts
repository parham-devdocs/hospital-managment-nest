// auth.controller.ts
import { Controller, Post, Body, Res, Req, Request } from '@nestjs/common';
import {type Response } from 'express';
import { AuthService } from '../services/auth/auth.service';


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
    

    res.clearCookie('access_token');

    return res.status(201).json({
      success: true,
      message: 'Logout successful'
    });
  }
}
