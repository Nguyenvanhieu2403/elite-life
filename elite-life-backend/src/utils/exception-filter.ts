import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        switch (status) {
            case HttpStatus.NOT_FOUND:
            case HttpStatus.INTERNAL_SERVER_ERROR:
                response.status(status).json({
                    statusCode: status,
                    message: 'Internal server error',
                });
                break;
            default:
                response.status(status).json(exception.getResponse());
                break;
        }
    }
}