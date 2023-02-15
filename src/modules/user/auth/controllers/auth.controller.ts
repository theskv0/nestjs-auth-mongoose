import { Body, Controller, Post, Request, Get } from '@nestjs/common';
import { Headers, UseGuards } from '@nestjs/common/decorators';
import { SignupDto, SignupSchema } from '../dtos/signup.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import JoiValidationPipe from 'src/utils/joi.validator';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';
import { LoginDto, LoginSchema } from '../dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body(new JoiValidationPipe(SignupSchema)) signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  login(@Body(new JoiValidationPipe(LoginSchema)) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req) {
    return {
      status: true,
      message: 'Success!',
      data: {
        profile: req.user,
      },
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Get('refresh-token')
  refreshToken(@Request() req) {
    return this.authService.getTokens(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('logout')
  logout(@Headers('Authorization') access_token: string) {
    return this.authService.logout(access_token);
  }
}
