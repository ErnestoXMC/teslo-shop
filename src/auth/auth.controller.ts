import { Controller, Get, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { RawHeaders, GetUser } from './decorators';
import type { IncomingHttpHeaders } from 'http';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async create(@Body() createUserDto: CreateUserDto) {
        return await this.authService.create(createUserDto);
    }

    @Post('login')
    async loginUser(@Body() loginUserDto: LoginUserDto){
        return await this.authService.loginUser(loginUserDto);
    } 

    //* AuthGuard() usa la estrategia configurada en el passport (jwt)
    @Get('private')
    @UseGuards(AuthGuard())
    testingPrivateRoute(
        //* Despues del guard obtenemos los datos del usuario desde la request
        //* Si le pasamos alguna data como parametro de nuestro decorador, accederemos a este mediante data
        //* Los decoradores usualmente toman un parametro o no toman ninguno, pero en este caso tenemos la opcion de mandar varios parametros mediante un arreglo ['email', 'roles']
        @GetUser() user: User,
        @GetUser('email') userEmail: string,
        @GetUser(['email', 'fullName']) userEmailFullName: string,
        @RawHeaders() rawHeader: string[],
        @Headers() headers: IncomingHttpHeaders, //* Similar a nuestro rawheader, usar este decorador
    ){
        return {
            user,
            userEmail,
            userEmailFullName,
            rawHeader,
            headers
        }
    }
}
