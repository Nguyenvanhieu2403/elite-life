import {
  HttpException,
  HttpStatus,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';

function transformErrors(errors: ValidationError[]) {
  const transformedErrors = errors.reduce(
    (accumulator, currentValue) => {
      if (currentValue.children && currentValue.children.length > 0) {
        return {
          ...accumulator,
          [currentValue.property]: transformErrors(currentValue.children),
        }
      }
      return {
        ...accumulator,
        [currentValue.property]: Object.values(
          currentValue.constraints ?? {},
        ).join(', '),
      }
    },
    {},
  );

  return transformedErrors
}

const validationOptions: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
  errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
  exceptionFactory: (errors: ValidationError[]) => {
    const transformedErrors = transformErrors(errors);

    return new HttpException(
      {
        status: false,
        message: transformedErrors
      },
      HttpStatus.OK,
    );
  }
};

export default validationOptions;
