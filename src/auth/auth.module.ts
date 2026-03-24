import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    imports: [

        //* Modulo para utilizarlo en nuestro jwt strategy
        ConfigModule,

        //* Declaramos nuestra entidad para poder injectarlo en nuestro providers
        TypeOrmModule.forFeature([User]),

        //* Definimos como se autenticaran los usuarios, en este caso JWT
        PassportModule.register({ defaultStrategy: 'jwt' }),

        //* Configuracion asincrona de nuestro jwt y poder usarlo en nuestro servicio
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get("JWT_SECRET") || 'defaultSecret',
                    signOptions: {
                        expiresIn: '2h' //* Expiracion en dos horas
                    }
                }
            }
        })
    ],
    exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule]
    //* TypeOrmModule -> Para que otros modulos accedan a nuestro repositorio de usuarios
    //* JwtStrategy -> Estrategia este disponible globalmente y los guards puedan usarlo
    //* PassportModule -> Para que los guards y decoradores de autenticacion funcionen en otros modulos
    //* JwtModule -> Para poder firmar y verificar el JWT desde otros servicios y modulos
})
export class AuthModule { }
