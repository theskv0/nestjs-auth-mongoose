import { PipeTransform, UnprocessableEntityException } from '@nestjs/common';

export default class JoiValidationPipe<TDto, TSchema>
  implements PipeTransform<TDto>
{
  private schema;
  constructor(schema: TSchema) {
    this.schema = schema;
  }
  public transform(value: TDto): TDto {
    const result = this.schema.validate(value);
    if (result.error) {
      const errors = {};
      result.error.details.forEach((err) => {
        errors[err.context.key] = err.message;
      });
      throw new UnprocessableEntityException({
        status: false,
        message: 'Invalid input!',
        data: { errors },
      });
    }
    return value;
  }
}
