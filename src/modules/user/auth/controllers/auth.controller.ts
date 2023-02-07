import { Body, Controller, Post, Request, Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { SignupDto, SignupSchema } from '../dtos/signup.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import JoiValidationPipe from 'src/utils/joi.validator';
import LoginDto from '../dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  signup(@Body(new JoiValidationPipe(SignupSchema)) signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
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
}
