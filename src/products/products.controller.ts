import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces/valid-roles.interfaces';
import { User } from 'src/auth/entities/user.entity';
import { ApiResponse } from '@nestjs/swagger';
import { Product } from './entities';
import { ApiCreate } from 'src/common/decorators/api-create.decorator';

@Controller('products')
@Auth()
@ApiResponse({status: 500, description: "Error interno en el sistema"})
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @Auth(ValidRoles.admin)
    @ApiCreate(Product, "Producto")
    async create(
        @Body() createProductDto: CreateProductDto,
        @GetUser() user: User
    ) {
        return await this.productsService.create(createProductDto, user);
    }

    @Get()
    @Auth(ValidRoles.user, ValidRoles.admin)
    async findAll(@Query() paginationDto: PaginationDto) {
        return await this.productsService.findAll(paginationDto);
    }

    @Get(':term')
    @Auth(ValidRoles.user, ValidRoles.admin)
    async findOne(@Param('term') term: string) {
        return await this.productsService.findOne(term);
    }

    @Patch(':id')
    @Auth(ValidRoles.admin)
    async update(
        @Param('id', ParseUUIDPipe) id: string, 
        @Body() updateProductDto: UpdateProductDto,
        @GetUser() user: User
    ) {
        return await this.productsService.update(id, updateProductDto, user);
    }

    @Delete(':id')
    @Auth(ValidRoles.admin)
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return await this.productsService.remove(id);
    }

    @Delete()
    @Auth(ValidRoles.admin)
    async deleteAll() {
        return await this.productsService.deleteAll();
    }
}
