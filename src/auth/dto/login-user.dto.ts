import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {
    
    @IsEmail({}, {message: "El campo email debe contener una dirección de correo válida"})
    email: string;

    @IsString({message: "La contraseña debe ser un texto"})
    @MinLength(8, {message: "La contraseña debe de tener como minimo 8 caracteres"})
    @MaxLength(50, {message: "La contraseña debe tener como máximo 50 caracteres"})
    @Matches(
        /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 
        {
            message: 'La contraseña debe contener al menos una letra mayúscula, una letra minúscula y un número o carácter especial.'
        }
    ) password: string;
}