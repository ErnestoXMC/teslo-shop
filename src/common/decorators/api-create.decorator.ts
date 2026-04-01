import { applyDecorators, Type } from "@nestjs/common";
import { ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiOperation, ApiUnauthorizedResponse } from "@nestjs/swagger";


export const ApiCreate = (model: Type<any>, entityName: string) => {
    return applyDecorators(
        //* Titulo de nuestro Endpoint
        ApiOperation({ summary: `Crear ${entityName}` }),

        //* 201
        ApiCreatedResponse({
            description: `${entityName} ha sido creado exitosamente`,
            type: model
        }),

        //* 400: Error de validación o duplicados
        ApiBadRequestResponse({
            description: 'Datos inválidos, elementos duplicados en nuestra base de datos.'
        }),

        //* 401: Token inválido o sin autorizacion
        ApiUnauthorizedResponse({
            description: 'No autorizado. Token inexistente o expirado.'
        }),

        //* 403: Falta de permisos (Roles)
        ApiForbiddenResponse({
            description: 'Prohibido. No tienes los permisos de administrador necesarios.'
        }),

        //* 500: Error del servidor
        ApiInternalServerErrorResponse({
            description: 'Error interno. Por favor, revisa los logs del servidor.'
        }),
    )
};
