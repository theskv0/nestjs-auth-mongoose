import * as Joi from 'joi';

export class SignupDto {
  name: string;
  email: string;
  password: string;
}

export const SignupSchema = Joi.object({
  name: Joi.string().min(2).max(32).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(32).required(),
}).options({
  abortEarly: false,
});
