import {
  Injectable,
  NestMiddleware,
  NotAcceptableException,
} from '@nestjs/common';

@Injectable()
export class AppMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const apikey = req.headers['x-api-key'];
    if (apikey) {
      if (apikey === process.env.API_KEY) {
        return next();
      }
      throw new NotAcceptableException({
        status: false,
        message: 'Invalid api key!',
        data: {},
      });
    }
    throw new NotAcceptableException({
      status: false,
      message: 'Api key is required!',
      data: {},
    });
  }
}
