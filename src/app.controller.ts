import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { RegisterDto } from './auth/dto/register.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('register') // Maps to POST /auth/register
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}
