import { Controller, HttpCode, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @Get('/auth')
  @HttpCode(200)
  async token() {
    return this.jwtService.sign({ roles: ['admin'] }, { expiresIn: '10y' });
  }
}
