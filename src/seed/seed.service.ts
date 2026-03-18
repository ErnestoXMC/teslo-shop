import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

    constructor(
        private readonly productService: ProductsService,
    ) { }


    async runSeed() {

        try {
            await this.insertNewProducts();
            return "Ejecutando el seed";
        } catch (error) {
            if(error instanceof InternalServerErrorException) throw error;
            if (error instanceof BadRequestException) throw error;

            console.log(error);
            throw new InternalServerErrorException("Error al ejecutar seed de productos");
        }
    }

    private async insertNewProducts() {
        try {
            //* Eliminar todos nuestros registros previos y luego agregar los nuevos
            await this.productService.deleteAll();
            await this.productService.createAll(initialData.products);

        } catch (error) {
            if (error instanceof BadRequestException) throw error;
            if (error instanceof InternalServerErrorException) throw error;

            console.log(error);
            throw new InternalServerErrorException("Error al insertar nuevos registros en productos");
        }
    }

}
