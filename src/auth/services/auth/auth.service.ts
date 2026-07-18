import { Injectable } from '@nestjs/common';
import { LoginService } from './login.service';
import { RegsiterService } from './register.service';
import { LogoutService } from './logout.service';
import { RegisterAuthDto } from 'src/auth/dto/register-auth.dto';
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly registerService: RegsiterService,
    private readonly loginService: LoginService,
    private readonly logoutService: LogoutService,
  ) {}

  login(loginAuthDto:LoginAuthDto) {
    return this.loginService.login(loginAuthDto);
  }
  logout() {
    return this.logoutService.logout();
  }
  register(registerAuthDto: RegisterAuthDto) {
    return this.registerService.register(registerAuthDto);
  }
  
}
