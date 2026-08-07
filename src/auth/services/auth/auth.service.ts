import { Injectable } from '@nestjs/common';
import { LoginService } from './login.service';
import { LogoutService } from './logout.service';
import { LoginAuthDto } from 'src/auth/dto/login-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly loginService: LoginService,
    private readonly logoutService: LogoutService,
    
  ) {}

  login(loginAuthDto:LoginAuthDto) {
    return this.loginService.login(loginAuthDto);
  }
  logout(id:string) {
    return this.logoutService.logout(id);
  }

  
}
