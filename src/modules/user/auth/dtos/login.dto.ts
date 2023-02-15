import * as Joi from 'joi';

export class LoginDto {
  email: string;
  password: string;
}

export const LoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(32).required(),
}).options({
  abortEarly: false,
});
