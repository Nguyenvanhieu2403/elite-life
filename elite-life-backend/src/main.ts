import { NestFactory } from '@nestjs/core';
import { AppModule, adminModule, saleModule } from './app.module';
import logger, { MyLogger } from './utils/logger';
import { ConfigService } from '@nestjs/config';
import { useContainer } from 'class-validator';
import { AllConfigType, AppConfig } from './config/config.type';
import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import validationOptions from './utils/validation-options';
import { NextFunction, Request, Response } from 'express';
import * as compression from 'compression';
import { AllExceptionsFilter } from './utils/exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  const configService = app.get(ConfigService<AllConfigType>);

  app.useGlobalPipes(new ValidationPipe(validationOptions));
  app.setGlobalPrefix(configService.getOrThrow('app.apiPrefix', { infer: true }), { exclude: ['/'], });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableVersioning({ type: VersioningType.URI });
  app.use(compression());

  createSwagger("/docs/admin", app, configService, { include: adminModule });
  createSwagger("/docs/sale", app, configService, { include: saleModule });

  app.enableCors();
  await app.listen(configService.getOrThrow('app.port', { infer: true }));

  app.useLogger(new MyLogger())

  logger.info(`RESTful API server started on: ${configService.getOrThrow('app.port', { infer: true })}`);
}

export function createSwagger(docsName: string, app: INestApplication, configService: ConfigService<AllConfigType>, swaggerDocumentOptions?: SwaggerDocumentOptions) {
  const options = new DocumentBuilder()
    .setTitle('API')
    .setDescription('API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  let docsUser = configService.getOrThrow('app.docsUser', { infer: true })
  let docsPassword = configService.getOrThrow('app.docsPassword', { infer: true })
  if (docsUser && docsPassword) {
    const http_adapter = app.getHttpAdapter();
    http_adapter.use(
      `/${docsName}`,
      (req: Request, res: Response, next: NextFunction) => {
        function parseAuthHeader(input: string): { name: string; pass: string } {
          const [, encodedPart] = input.split(' ');

          const buff = Buffer.from(encodedPart, 'base64');
          const text = buff.toString('ascii');
          const [name, pass] = text.split(':');

          return { name, pass };
        }

        function unauthorizedResponse(): void {
          if (http_adapter.getType() === 'fastify') {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic');
          } else {
            res.status(401);
            res.set('WWW-Authenticate', 'Basic');
          }

          next();
        }

        if (!req.headers.authorization) {
          return unauthorizedResponse();
        }

        const credentials = parseAuthHeader(req.headers.authorization);
        if (docsUser &&
          credentials?.name !== docsUser ||
          credentials?.pass !== docsPassword
        ) {
          return unauthorizedResponse();
        }

        next();
      },
    );
  }

  const document = SwaggerModule.createDocument(app, options, swaggerDocumentOptions);
  SwaggerModule.setup(docsName, app, document);

}

bootstrap();
