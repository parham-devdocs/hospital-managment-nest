// auth.controller.ts
import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { type Request, type Response } from 'express';
import { AuthServiceResponse } from '../types';
import { AuthService } from '../services/auth/auth.service';
import { RegisterAuthDto } from '../dto/register-auth.dto';

@Controller('auth')
export class LoginController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async register(
    @Body()  registerAuthDto:RegisterAuthDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {

    const result: AuthServiceResponse =
      await this.authService.register(registerAuthDto);
    const { accessToken, user } = result;

    // ✅ Set cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    // ✅ Return response
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: user,
    });
  }
}
