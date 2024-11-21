import { HttpException, HttpStatus } from "@nestjs/common";
import { randomStringGenerator } from "@nestjs/common/utils/random-string-generator.util";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MulterModule, MulterModuleAsyncOptions, MulterModuleOptions } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import *  as path from "path";
import * as fs from 'fs';
import { AllConfigType } from "src/config/config.type";
import { v4 as uuidv4 } from 'uuid';

export const MulterUploadModule = MulterModule.registerAsync(useMulterFactory())

function useMulterFactory(allowExts: string[] = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx', 'doc']): MulterModuleAsyncOptions {
    return {
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService<AllConfigType>) => {
            return multerConfig(configService, allowExts)
        },
    }
}
export function userFileFilter(request, file, callback, allowExts: string[]) {
    const fileExt = file.originalname.split('.').pop().toLowerCase();

    if (!allowExts.includes(fileExt)) {
        return callback(
            new HttpException(
                {
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        file: `cantUploadFileType`,
                    },
                },
                HttpStatus.UNPROCESSABLE_ENTITY,
            ),
            false,
        );
    }

    callback(null, true);
}

function multerConfig(configService: ConfigService<AllConfigType>, allowExts: string[]): Promise<MulterModuleOptions> | MulterModuleOptions {
    let dirFileTemp = path.join(configService.getOrThrow('app.dirFile', { infer: true }), 'tmp');
    if (!fs.existsSync(dirFileTemp)) fs.mkdirSync(dirFileTemp, { recursive: true });
    const storages = {
        local: () =>
            diskStorage({
                destination: dirFileTemp,
                filename: (request, file, callback) => {
                    callback(
                        null,
                        `${uuidv4()}.${file.originalname
                            .split('.')
                            .pop()
                            ?.toLowerCase()}`,
                    );
                },
            })
    };

    return {
        storage:
            storages[
                configService.getOrThrow('file.driver', { infer: true })
            ](),
        limits: {
            fileSize: configService.get('file.maxFileSize', { infer: true }),
        },
    };
}
