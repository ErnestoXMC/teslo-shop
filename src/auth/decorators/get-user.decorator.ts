import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

//* Para poder obtener el usuario de la request previamente debemos haber pasado por el guard de autenticacion, si no entra a la excepcion
export const GetUser = createParamDecorator(
    //* data -> Campos que obtenemos desde nuestro decorator
    //* ctx -> Obtenemos el contexto y la request

    (data, ctx: ExecutionContext) => {
        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if(!user){
            console.log("Error en GetUser Decorator - Verificar guard de autenticacion");
            throw new InternalServerErrorException("No se encontró al usuario");
        }

        return user;
    }
)

