import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsString, Matches, MaxLength, Min, MinLength } from "class-validator";
import { Gender, TypeProduct } from "../entities/product.entity";

export class CreateProductDto {

    @ApiProperty({
        example: "Polo Azul Oversize",
        description: "Título único del producto",
        minLength: 1,
        maxLength: 150
    })
    @IsString({ message: 'El título debe ser un texto' })
    @MinLength(1, { message: 'El título no puede estar vacío' })
    @MaxLength(150, { message: 'El título no puede tener más de 150 caracteres' })
    title: string;

    @ApiProperty({
        example: 99.90,
        description: "Precio del producto (hasta 2 decimales)",
        default: 0,
        required: false
    })
    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio solo puede tener hasta 2 decimales' })
    @Min(0, { message: 'El precio debe ser mayor o igual a 0' })
    price?: number;

    @ApiProperty({
        example: "Producto de algodón premium en oferta",
        description: "Descripción detallada del producto",
        required: false,
        nullable: true
    })
    @IsOptional()
    @IsString({ message: 'La descripción debe ser un texto' })
    @MinLength(1, { message: 'La descripción no puede estar vacía' })
    @MaxLength(700, { message: 'La descripción no puede tener más de 700 caracteres' })
    description?: string;

    @ApiProperty({
        example: "polo_azul_oversize",
        description: "Slug amigable para URL (se genera del título si no se envía)",
        required: false
    })
    @IsOptional()
    @IsString({ message: 'El slug debe ser un texto' })
    @MinLength(1, { message: 'El slug no puede estar vacío' })
    @Matches(/^[a-z0-9-_]+$/, { message: 'El slug solo puede contener minúsculas, números y guiones' })
    slug?: string;

    @ApiProperty({
        example: 100,
        description: "Cantidad de productos en inventario",
        default: 0,
        required: false
    })
    @IsOptional()
    @IsInt({ message: 'El stock debe ser un número entero' })
    @Min(0, { message: 'El stock debe ser mayor o igual a 0' })
    stock?: number;

    @ApiProperty({
        example: ["S", "M", "L"],
        description: "Tallas disponibles del producto",
        isArray: true
    })
    @IsString({ each: true, message: 'Cada talla debe ser un texto' })
    @IsArray({ message: 'Las tallas deben ser un arreglo de textos' })
    sizes: string[];

    @ApiProperty({
        example: "men",
        description: "Género al que va dirigido el producto",
        enum: Gender
    })
    @IsIn(Object.values(Gender), { message: 'El género no es válido' })
    gender: Gender;

    @ApiProperty({
        example: ["azul", "oversize", "nuevo"],
        description: "Etiquetas de búsqueda",
        isArray: true,
        required: false
    })
    @IsOptional()
    @IsString({each: true, message: 'Cada tag debe ser un texto'})
    @IsArray({message: 'Los tags deben ser un arreglo'})
    tags?: string[];

    @ApiProperty({
        example: "shirts",
        description: "Categoría o tipo de producto",
        enum: TypeProduct
    })
    @IsIn(Object.values(TypeProduct), { message: 'El tipo no es válido' })
    type: string;
    
    @ApiProperty({
        example: ["https://image1.jpg", "https://image2.jpg"],
        description: "Arreglo de URLs de las imágenes del producto",
        isArray: true,
        required: false
    })
    @IsOptional()
    @IsString({each: true, message: 'Cada imagen debe ser un texto'})
    @IsArray({message: 'Las imágenes deben ser un arreglo'})
    images?: string[];
}