// auth.controller.ts
import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import { type Request, type Response } from 'express';
import { RegsiterService } from '../services/auth/register.service';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { RegisterServiceResponse } from '../types';
@Controller('auth')
export class RegisterController {
  constructor(private readonly registerService: RegsiterService) {}

  @Post('register')
  async register(
    @Body() signUpAuthDto: RegisterAuthDto,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    console.log(signUpAuthDto);

    const result: RegisterServiceResponse = await this.registerService.register(signUpAuthDto);
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
