import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { TokenResponse } from './interfaces/auth-response.interface';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly JwtService: JwtService,
    ){}

    async create(createUserDto: CreateUserDto): Promise<TokenResponse> {
        try {
            const {password, ...userData} = createUserDto;

            //* Hasheo de la contraseña
            const user = await this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10)
            })

            const userSaved = await this.userRepository.save(user);

            return {
                token: this.generateJwt({id: userSaved.id})
            }

        } catch (error) {
            if(error.code === "23505")
                throw new BadRequestException("El email ya se encuentra registrado")

            console.log(error)
            throw new InternalServerErrorException("Error al registrar el usuario")
        }
    }

    async loginUser(loginUserDto: LoginUserDto): Promise<TokenResponse>{

        const {password, email } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: {email},
            select: {email: true, password: true, id: true},
        })

        //* Excepcion en caso el usuario no existe
        if(!user) throw new UnauthorizedException("El email no ha sido registrado");

        //* Excepcion en caso la contraseña no exista
        if(!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException("La contraseña es incorrecta");

        return {
            token: this.generateJwt({id: user.id})
        };
    }

    async checkStatus(user){
        return {
            token: this.generateJwt({id: user.id})
        }
    }

    private generateJwt(payload: JwtPayload): string{
        const token = this.JwtService.sign(payload);
        return token;
    }

}
