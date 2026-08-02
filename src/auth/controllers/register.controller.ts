// auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { type Request, type Response } from 'express';
import { RegsiterService } from '../services/auth/register.service';
import { RegisterAuthDto } from '../dto/register-auth.dto';
import { RegisterServiceResponse } from '../types';
import { FileSizeValidationPipe } from 'src/file/fileValidationPipe.pipe';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class RegisterController {
  constructor(private readonly registerService: RegsiterService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('file'))
  async register(
    @Body(new ValidationPipe({ transform: true })) signUpAuthDto: any,
    @UploadedFile(new FileSizeValidationPipe({ maxSizeInMB: 15 })) file: any,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    if (!file) {
      throw new BadRequestException('Avatar file is required');
    }

    // Store the file path (you should save it to your storage)
    const avatarUrl = await this.registerService.saveAvatarFile(file);

    const result: RegisterServiceResponse = await this.registerService.register(
      {
        ...signUpAuthDto,
      },
      avatarUrl,
    );

    const { accessToken, user } = result;

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: user,
    });
  }
}
