import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    async create(
        @Body() createProductDto: CreateProductDto
    ) {
        return await this.productsService.create(createProductDto);
    }

    @Get()
    async findAll(@Query() paginationDto: PaginationDto) {
        return await this.productsService.findAll(paginationDto);
    }

    @Get(':term')
    async findOne(@Param('term') term: string) {
        return await this.productsService.findOne(term);
    }

    //TODO Finalizar metodo
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
        return this.productsService.update(+id, updateProductDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        return await this.productsService.remove(id);
    }
}
