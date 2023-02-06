import { Body, Controller, Post, Request, Get } from '@nestjs/common';
import { UseGuards } from '@nestjs/common/decorators';
import { SignupDto, SignupSchema } from '../dtos/signup.dto';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import JoiValidationPipe from 'src/utils/joi.validator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('signup')
  signup(@Body(new JoiValidationPipe(SignupSchema)) signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this.authService.login(req.user);
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
