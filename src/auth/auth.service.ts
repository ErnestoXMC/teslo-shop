import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";
import { CreateUserDto, LoginUserDto } from './dto';

@Injectable()
export class AuthService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>
    ){}

    async create(createUserDto: CreateUserDto) {
        try {
            const {password, ...userData} = createUserDto;

            //* Hasheo de la contraseña
            const user = await this.userRepository.create({
                ...userData,
                password: bcrypt.hashSync(password, 10)
            })

            return await this.userRepository.save(user);

            //TODO: Retornar JWT

        } catch (error) {
            
            if(error.code === "23505")
                throw new BadRequestException("El email ya se encuentra registrado")

            console.log(error)
            throw new InternalServerErrorException("Error al registrar el usuario")
        }
    }

    async loginUser(loginUserDto: LoginUserDto){

        const {password, email } = loginUserDto;

        const user = await this.userRepository.findOne({
            where: {email},
            select: {email: true, password: true},
        })

        //* Excepcion en caso el usuario no existe
        if(!user) throw new UnauthorizedException("El email no ha sido registrado");

        //* Excepcion en caso la contraseña no exista
        if(!bcrypt.compareSync(password, user.password))
            throw new UnauthorizedException("La contraseña es incorrecta");

        return user;
        //TODO: Retornar JWT

    }

}
