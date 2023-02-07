import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { AuthController } from './auth/controllers/auth.controller';
import { AuthService } from './auth/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { Device } from 'src/entities/device.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Device]),
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  exports: [AuthService],
})
export class UserModule {}
