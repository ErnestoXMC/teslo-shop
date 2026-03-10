import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { AcceptLanguageResolver, I18nJsonLoader, I18nModule } from 'nestjs-i18n';
import { CommonModule } from './common/common.module';

@Module({
    imports: [
        //* Configuracion para usar variables de entorno
        ConfigModule.forRoot(),

        //* Configuracion TypeOrm
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: +process.env.DB_PORT!,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            //* Intentos de conexion a nuestra bd (default: 10)
            retryAttempts: 5,
            //* Carga automatica de las entidades
            autoLoadEntities: true,
            //* Sincronizacion de nuestras entidades con nuestra bd
            //! En produccion cambiarlo a false, utilizar migraciones
            synchronize: true,
        }),

        //* Configuracion I18n global
        I18nModule.forRoot({
            fallbackLanguage: 'es', //* Por defecto español
            loader: I18nJsonLoader, 
            loaderOptions: {
                path: __dirname + '/../src/i18n/', //* Archivo de traduccion
                watch: true, //* Recarga traducciones automaticamente si cambian los archivos
            },
            resolvers: [
                AcceptLanguageResolver, //* Obtiene el idioma desde el header: Accept-Language
            ],
        }),

        //* Modulos Generales
        ProductsModule,
        CommonModule
    ]
})
export class AppModule { }
