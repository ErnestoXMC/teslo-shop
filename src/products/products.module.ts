import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService],
    imports: [
        //* Declarar nuestras entidades para inyectar sus repositorios en nuestros servicios
        TypeOrmModule.forFeature([Product])
    ]
})
export class ProductsModule { }
