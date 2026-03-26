import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto } from './dto';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';

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
        @GetUser() user: User
    ){
        return {
            user
        }
    }
}
