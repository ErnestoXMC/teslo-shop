import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductImage } from './entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
    controllers: [ProductsController],
    providers: [ProductsService],
    imports: [
        //* Declarar nuestras entidades para inyectar sus repositorios en nuestros servicios
        TypeOrmModule.forFeature([Product, ProductImage]),
        AuthModule
    ],
    exports: [
        ProductsService,
        TypeOrmModule //* Solo en caso se requiera usar los repositorios de Product y ProductImage en otros modulos
    ]
})
export class ProductsModule { }
