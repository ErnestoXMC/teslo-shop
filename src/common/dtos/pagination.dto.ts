import { IsIn, IsOptional, Min } from "class-validator";


export class PaginationDto {

    @IsOptional()
    @Min(0, {message: "El parametro limit debe ser mayor o igual que cero"})
    limit?: number;

    @IsOptional()
    @Min(0, {message: "El parametro limit debe ser mayor o igual que cero"})
    offset?: number;

    @IsOptional()
    @IsIn([0, 1], {message: "El parametro isActive debe estar entre 0 y 1"})
    isActive?: number;
}