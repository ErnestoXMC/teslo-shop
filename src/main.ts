import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.setGlobalPrefix('api');

    //* Configuracion validators (dtos)
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                exposeUnsetFields: false,
                enableImplicitConversion: true
            }
        })
    )

    //* Configuracion Swagger + Scalar
    const config = new DocumentBuilder()
        .setTitle('Teslo RESTFull Api')
        .setDescription('Teslo shop endpoints')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);

    app.use('/docs', apiReference({
        content: document,
        theme: 'bluePlanet',
        darkMode: true,
        defaultHttpClient: {
            targetKey: 'node',
            clientKey: 'axios',
        },
    }));

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
