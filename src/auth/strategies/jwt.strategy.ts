import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { User } from "../entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET') || 'defaultSecret',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    //* Se llama cuando el JWT no ha expirado y si la firma hace match con el payload
    //* Filtro final de proteccion de rutas, valida la existencia del usuario
    //* Envia el usuario autenticado a nuestra request
    async validate(payload: JwtPayload): Promise<User> {

        const {id} = payload;

        const user = await this.userRepository.findOneBy({id});

        if(!user)
            throw new UnauthorizedException("Usuario no encontrado");

        if(!user.isActive)
            throw new UnauthorizedException("Usuario inhabilitado, contactese con su administrador");

        return user;
    }

}