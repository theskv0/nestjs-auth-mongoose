import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { SignupDto } from '../dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import LoginDto from '../dtos/login.dto';
import { Device } from 'src/entities/device.entity';
import { randomBytes } from 'crypto';
import Constant from 'src/configs/constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Device) private deviceRepository: Repository<Device>,
    private jwtService: JwtService,
  ) {}

  async signup(@Body() signupDto: SignupDto) {
    const user = await this.userRepository.findOne({
      where: { email: signupDto.email },
    });
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
    signupDto.password = await argon2.hash(signupDto.password);
    await this.userRepository.save(signupDto);
    return {
      status: true,
      message: 'Success!',
      data: {},
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException({
        status: false,
        message: 'Invalid email or password!',
        data: {},
      });
    }
    const tokens = await this.registerDevice(user);
    return {
      status: true,
      message: 'Success!',
      data: {
        profile: user,
        tokens,
      },
    };
  }

  async profile(id: number) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  private async validateUser(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password'],
    });
    if (user) {
      if (await argon2.verify(user.password, password)) {
        delete user.password;
        return user;
      }
    }
    return null;
  }

  async getDevice(session_id: string) {
    const device = await this.deviceRepository.findOne({
      where: {
        type: Constant.AUTH_TYPE.User,
        session_id: session_id,
      },
    });
    return device || null;
  }

  private async registerDevice(user: User) {
    const session_id = randomBytes(64).toString('hex');
    const payload = {
      auth_id: user.id,
      auth_email: user.email,
      session_id,
    };
    const device = await this.deviceRepository.findOneBy({
      type: Constant.AUTH_TYPE.User,
      user_id: user.id,
    });
    if (device) {
      device.session_id = session_id;
      await device.save();
    } else {
      await this.deviceRepository.save({
        type: Constant.AUTH_TYPE.User,
        user_id: user.id,
        session_id,
      });
    }
    const access_token = await this.jwtService.sign(payload, {
      secret: process.env.APP_SECRET,
      expiresIn: '1m',
    });
    const refresh_token = await this.jwtService.sign(payload, {
      secret: process.env.APP_SECRET,
      expiresIn: '5m',
    });
    return {
      access_token,
      refresh_token,
    };
  }
}
