// import { UnprocessableEntityException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     stopAtFirstError: true,
  //     exceptionFactory: (errors) => {
  //       const errMessages = {};
  //       errors.forEach((error) => {
  //         errMessages[error.property] = Object.values(error.constraints)[0];
  //       });
  //       return new UnprocessableEntityException({
  //         status: false,
  //         message: 'Invalid input!',
  //         data: {
  //           errors: errMessages,
  //         },
  //       });
  //     },
  //   }),
  // );
  await app.listen(process.env.APP_PORT);
}
bootstrap();
