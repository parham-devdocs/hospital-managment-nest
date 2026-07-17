// auth.controller.ts
import { Controller, Post, Body, Res, Req } from '@nestjs/common';
import {type Request, type  Response } from 'express';
import { SignUpAuthDto } from './dto/signup-auth.dto';
import { AuthServiceResponse } from './types';
import { AuthService } from './services/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() signUpAuthDto: SignUpAuthDto, @Res() res: Response ,@Req() req:Request): Promise<Response> {
    console.log(signUpAuthDto);
    
    const result: AuthServiceResponse = await this.authService.register(signUpAuthDto);
    const { accessToken, user } = result;  
    
    // ✅ Set cookie
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:  60 * 60 * 1000,
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