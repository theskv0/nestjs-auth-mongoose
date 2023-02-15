import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { AdminModule } from './modules/admin/admin.module';
import { RouterModule } from '@nestjs/core';
import { AppMiddleware } from './middlewares/app/app.middleware';
import { ConfigModule } from '@nestjs/config';
// import { User } from './entities/user.entity';
// import { Device } from './entities/device.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      dbName: 'nest_auth',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      connectionFactory: (conn) => {
        console.log('Database connected!');
        return conn;
      },
      connectionErrorFactory(error) {
        console.log(error);
        return error;
      },
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
