import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    controllers: [AuthController],
    providers: [AuthService],
    imports: [
        TypeOrmModule.forFeature([User]),

        //* Definimos como se autenticaran los usuarios, en este caso JWT
        PassportModule.register({ defaultStrategy: 'jwt' }),

        //* Configuracion asincrona de nuestro jwt
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get("JWT_SECRET") || 'defaultSecret',
                    signOptions: {
                        expiresIn: '2h'
                    }
                }
            }
        })
    ]
})
export class AuthModule { }
