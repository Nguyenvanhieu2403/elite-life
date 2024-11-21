import * as winston from 'winston';
import { format } from 'winston';
import 'winston-daily-rotate-file';
import * as path from 'path';
import { LoggerService } from '@nestjs/common';

export default winston.createLogger({
    format: winston.format.combine(
        winston.format.splat(),
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.colorize(),
        winston.format.printf(
            log => {
                if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack} \n`;
                return `[${log.timestamp}] [${log.level}] ${JSON.stringify(log.message)} \n`;
            }
        ),
    ),

    transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
            filename: "%DATE%",
            datePattern: "YYYYMMDD[.log]",
            dirname: path.join(__dirname, `../../logs/`),
            json: true,
            maxSize: '20m',
            maxFiles: '2d'
        })
    ],
});

export function loggerCustom(fileName: string = "logging.") {
    return winston.createLogger({
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.colorize(),
            winston.format.printf(
                log => {
                    if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack} \n`;
                    return `[${log.timestamp}] [${log.level}] ${JSON.stringify(log.message)} \n`;
                }
            ),
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.DailyRotateFile({
                filename: `${fileName}%DATE%`,
                datePattern: `YYYYMMDD[.log]`,
                dirname: path.join(__dirname, `../../logs/`),
                json: true,
                maxSize: '20m',
                maxFiles: '2d'
            })
        ],
    })
}

export class MyLogger implements LoggerService {
    private logger = winston.createLogger({
        format: winston.format.combine(
            winston.format.splat(),
            winston.format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            winston.format.colorize(),
            winston.format.printf(
                log => {
                    if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack} \n`;
                    return `[${log.timestamp}] [${log.level}] ${JSON.stringify(log.message)} \n`;
                }
            ),
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.DailyRotateFile({
                filename: "%DATE%",
                datePattern: "YYYYMMDD[.log]",
                dirname: path.join(__dirname, `../../logs/system/`),
                json: true,
                maxSize: '20m',
                maxFiles: '2d'
            })
        ],
    });

    /**
     * Write a 'log' level log.
     */
    log(message: any, ...optionalParams: any[]) {
        this.logger.info(message)
        if (optionalParams && optionalParams.length > 0) this.logger.info(optionalParams)
    }

    /**
     * Write an 'error' level log.
     */
    error(message: any, ...optionalParams: any[]) {
        this.logger.error(message)
        if (optionalParams && optionalParams.length > 0) this.logger.error(optionalParams)
    }

    /**
     * Write a 'warn' level log.
     */
    warn(message: any, ...optionalParams: any[]) {
        this.logger.warn(message)
        if (optionalParams && optionalParams.length > 0) this.logger.warn(optionalParams)
    }

    /**
     * Write a 'debug' level log.
     */
    debug?(message: any, ...optionalParams: any[]) {
        this.logger.debug(message)
        if (optionalParams && optionalParams.length > 0) this.logger.debug(optionalParams)
    }

    /**
     * Write a 'verbose' level log.
     */
    verbose?(message: any, ...optionalParams: any[]) { this.logger.verbose(message, optionalParams) }
}