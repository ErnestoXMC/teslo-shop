import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';
import { IsIn, IsOptional } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {

    @IsOptional()
    @IsIn([0, 1], {message: "El campo isActive debe tener valores entre 0 y 1"})
    isActive?: number;
}
