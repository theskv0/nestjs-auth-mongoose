import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SignupDto } from '../dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(@Body() signupDto: SignupDto) {
    const user = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });
    console.log(user);
    if (user) {
      throw new UnprocessableEntityException({
        status: false,
        message: 'Invalid input!',
        data: {
          errors: {
            email: 'email is already taken',
          },
        },
      });
    }
    await this.userRepository.save(signupDto);
    return {
      status: true,
      message: 'Success!',
      data: {},
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password'],
    });
    if (user) {
      if (user.password === password) {
        return user;
      }
    }
    return null;
  }

  async login(user: User) {
    const payload = {
      auth_id: user.id,
      auth_name: user.name,
      auth_email: user.email,
    };
    const access_token = this.jwtService.sign(payload, {
      secret: process.env.APP_SECRET,
    });
    return {
      status: true,
      message: 'Success!',
      data: {
        profile: user,
        access_token,
      },
    };
  }

  async profile(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }
}
