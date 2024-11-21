import { registerAs } from '@nestjs/config';
import { FileConfig } from './config.type';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';
import validateConfig from 'src/utils/validate-config';

enum FileDriver {
  LOCAL = 'local',
}

class EnvironmentVariablesValidator {
  @IsEnum(FileDriver)
  FILE_DRIVER: FileDriver;

}

export default registerAs<FileConfig>('file', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);

  return {
    driver: process.env.FILE_DRIVER ?? 'local',
    maxFileSize: 10 * 1024 * 1024, // 10mb
  };
});
