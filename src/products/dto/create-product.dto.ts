import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";
import { Gender } from "../entities/product.entity";

export class CreateProductDto {

    @IsString({ message: 'El título debe ser un texto' })
    @MinLength(1, { message: 'El título no puede estar vacío' })
    @MaxLength(150, { message: 'El título no puede tener más de 150 caracteres' })
    title: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio solo puede tener hasta 2 decimales' })
    @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
    price?: number;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser un texto' })
    @MinLength(1, { message: 'La descripción no puede estar vacía' })
    @MaxLength(700, { message: 'La descripción no puede tener más de 700 caracteres' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'El slug debe ser un texto' })
    @MinLength(1, { message: 'El slug no puede estar vacío' })
    @Matches(/^[a-z0-9-_]+$/, { message: 'El slug solo puede contener minúsculas, números y guiones' })
    slug?: string;

    @IsOptional()
    @IsInt({ message: 'El stock debe ser un número entero' })
    @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
    stock?: number;

    @IsString({ each: true, message: 'Cada talla debe ser un texto' })
    @IsArray({ message: 'Las tallas deben ser un arreglo de textos' })
    sizes: string[];

    @IsIn(Object.values(Gender), { message: 'El género no es válido' })
    gender: Gender;

    @IsOptional()
    @IsString({each: true, message: 'Cada tag debe ser un texto'})
    @IsArray({message: 'Los tags deben ser un arreglo'})
    tags?: string[];
}
