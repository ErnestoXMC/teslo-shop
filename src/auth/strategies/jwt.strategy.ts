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

        //TODO: Cambiarlo y volerlo private readonly
        configService: ConfigService
    ){
        super({
            secretOrKey: configService.get('JWT_SECRET') || 'defaultSecret',
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
        });
    }

    //* Se llama cuando el JWT no ha expirado y si la firma hace match con el payload
    //* Filtro final de proteccion de rutas, valida la existencia del usuario
    async validate(payload: JwtPayload): Promise<User> {

        const {email} = payload;

        const user = await this.userRepository.findOneBy({email});

        if(!user)
            throw new UnauthorizedException("Tóken no válido");

        if(!user.isActive)
            throw new UnauthorizedException("Usuario inhabilitado, contactese con su administrador");

        return user;
    }

}