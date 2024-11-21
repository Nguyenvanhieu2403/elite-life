import { registerAs } from '@nestjs/config';
import { AppConfig } from './config.type';
import validateConfig from 'src/utils/validate-config';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';
import * as path from 'path';

export enum Environment {
  Dev = 'dev',
  Prod = 'prod',
  Test = 'test',
}

class EnvironmentVariablesValidator {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment;

  @IsBoolean()
  @IsOptional()
  IS_VALIDATE_PERMISSION: boolean;

  @IsInt()
  @Min(0)
  @Max(65535)
  @IsOptional()
  APP_PORT: number;

  @IsUrl({ require_tld: false })
  @IsOptional()
  FRONTEND_DOMAIN: string;
  @IsUrl({ require_tld: false })
  @IsOptional()
  SALE_FRONTEND_DOMAIN: string;

  @IsUrl({ require_tld: false })
  @IsOptional()
  BACKEND_DOMAIN: string;

  @IsString()
  @IsOptional()
  API_PREFIX: string;

  @IsString()
  @IsOptional()
  APP_FALLBACK_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_HEADER_LANGUAGE: string;

  @IsString()
  @IsOptional()
  APP_DOCS_API_NAME: string;

  @IsString()
  @IsOptional()
  APP_DOCS_API_USER: string;

  @IsString()
  @IsOptional()
  APP_DOCS_API_PASSWORD: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return {
    nodeEnv: process.env.NODE_ENV || Environment.Dev,
    isPermissionValidate: (process.env.IS_VALIDATE_PERMISSION || 'true') == 'true',
    name: process.env.APP_NAME || 'app',
    workingDirectory: process.env.PWD || process.cwd(),
    frontendDomain: process.env.FRONTEND_DOMAIN,
    saleFrontendDomain: process.env.SALE_FRONTEND_DOMAIN ?? 'http://localhost',
    foreignFrontendDomain: process.env.FOREIGN_FRONTEND_DOMAIN ?? 'http://localhost',
    backendDomain: process.env.BACKEND_DOMAIN ?? 'http://localhost',
    port: process.env.APP_PORT
      ? parseInt(process.env.APP_PORT, 10)
      : process.env.PORT
        ? parseInt(process.env.PORT, 10)
        : 3000,
    apiPrefix: process.env.API_PREFIX || 'api',
    fallbackLanguage: process.env.APP_FALLBACK_LANGUAGE || 'en',
    headerLanguage: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',
    docsName: process.env.APP_DOCS_NAME || 'docs',
    docsUser: process.env.APP_DOCS_USER || '',
    docsPassword: process.env.APP_DOCS_PASSWORD || '',
    dirName: path.join(__dirname, '../'),
    dirFile: path.join(__dirname, '../../files'),
    dirTemplate: path.join(__dirname, '../../template'),
  };
});
