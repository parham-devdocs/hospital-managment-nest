import {
  Controller,
  Post,
  Body
} from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { SignUpAuthDto } from './dto/signup-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() signUpAuthDto: SignUpAuthDto) {
    console.log(signUpAuthDto);
    return this.authService.register(signUpAuthDto);
  }

 
}
