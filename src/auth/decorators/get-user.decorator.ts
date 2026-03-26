import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

//* Para poder obtener el usuario de la request previamente debemos haber pasado por el guard de autenticacion, si no entra a la excepcion
//! NO ES NECESARIO PASAR EN LOS DECORADORES UN ARREGLO
export const GetUser = createParamDecorator(
    //* data -> Campos que obtenemos desde nuestro decorator
    //* ctx -> Obtenemos el contexto y la request

    (data: string | string[], ctx: ExecutionContext) => {

        const req = ctx.switchToHttp().getRequest();
        const user = req.user;

        if(!user){
            console.log("Error en GetUser Decorator - Verificar guard de autenticacion");
            throw new InternalServerErrorException("No se encontró al usuario");
        }

        if(!data) return user;

        if(typeof data === 'string'){
            return user[data];
        }

        if(Array.isArray(data)){
            const result = {};

            data.forEach(key => {
                result[key] = user[key]
            })

            return result;
        }

        return user;
    }
)

