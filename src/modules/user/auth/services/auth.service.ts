import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/models/user.schema';
import { Body } from '@nestjs/common/decorators';
import { SignupDto } from '../dtos/signup.dto';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { LoginDto } from '../dtos/login.dto';
import { Device } from 'src/models/device.schema';
import { randomBytes } from 'crypto';
import Constant from 'src/configs/constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectModel('Device') private deviceModel: Model<Device>,
    private jwtService: JwtService,
  ) {}
  async signup(@Body() signupDto: SignupDto) {
    const user = await this.userModel.findOne({
      email: signupDto.email,
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
    await this.userModel.insertMany(signupDto);
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
    return await this.userModel.findOne({
      where: { id },
    });
  }
  private async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({
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
    const device = await this.deviceModel.findOne({
      where: {
        type: Constant.AUTH_TYPE.User,
        session_id: session_id,
      },
    });
    return device || null;
  }
  async getTokens(user: User) {
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
  async logout(access_token: string) {
    const payload = await this.jwtService.verify(
      access_token.replace('Bearer ', ''),
      {
        secret: process.env.JWT_ACCESS_SECRET,
      },
    );
    await this.deviceModel.deleteOne({
      type: Constant.AUTH_TYPE.User,
      session_id: payload.session_id,
    });
    return {
      status: true,
      message: 'Success!',
      data: {},
    };
  }
  private async registerDevice(user: any) {
    const session_id = randomBytes(64).toString('hex');
    const payload = {
      auth_id: user._id,
      auth_email: user.email,
      session_id,
    };
    const device = await this.deviceModel.findOne({
      type: Constant.AUTH_TYPE.User,
      user_ref: user._id,
    });
    if (device) {
      device.session_id = session_id;
      await device.save();
    } else {
      await this.deviceModel.insertMany({
        type: Constant.AUTH_TYPE.User,
        user_ref: user._id,
        session_id,
      });
    }
    const access_token = await this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '1m',
    });
    const refresh_token = await this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '5m',
    });
    return {
      access_token,
      refresh_token,
    };
  }
}
