import { registerAs } from '@nestjs/config';
import { AuthConfig } from './config.type';
import { IsString } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

class EnvironmentVariablesValidator {
  @IsString()
  ADMIN_AUTH_JWT_SECRET: string;

  @IsString()
  ADMIN_AUTH_JWT_TOKEN_EXPIRES_IN: string;

  @IsString()
  SALE_AUTH_JWT_SECRET: string;

  @IsString()
  SALE_AUTH_JWT_TOKEN_EXPIRES_IN: string;
}

export default registerAs<AuthConfig>('auth', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    admin: {
      secret: process.env.ADMIN_AUTH_JWT_SECRET,
      expires: process.env.ADMIN_AUTH_JWT_TOKEN_EXPIRES_IN,
    },
    sale: {
      secret: process.env.SALE_AUTH_JWT_SECRET,
      expires: process.env.SALE_AUTH_JWT_TOKEN_EXPIRES_IN,
    }
  };
});
