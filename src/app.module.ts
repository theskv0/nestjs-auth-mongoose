import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AdminModule } from './modules/admin/admin.module';
import { RouterModule } from '@nestjs/core';
import { AppMiddleware } from './middlewares/app/app.middleware';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/user.entity';
import { Device } from './entities/device.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [User, Device],
      synchronize: true,
    }),
    UserModule,
    AdminModule,
    RouterModule.register([
      {
        path: 'api/v1/admin',
        module: AdminModule,
      },
      {
        path: 'api/v1/user',
        module: UserModule,
      },
    ]),
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppMiddleware).forRoutes('*');
  }
}
