import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { AuthController } from './auth/controllers/auth.controller';
import { AuthService } from './auth/services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategy/jwt.strategy';
import { Device } from 'src/entities/device.entity';
import { RefreshStrategy } from './auth/strategy/refresh.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RefreshStrategy],
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, Device]),
    JwtModule.register({}),
  ],
  exports: [AuthService],
})
export class UserModule {}
