import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  registerUser(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.registroUser(createAuthDto);
  }

  @Post('/login')
  findAll(@Body() UpdateAuthDto: UpdateAuthDto) {
    return this.authService.LoginUser(UpdateAuthDto);
  }
}
