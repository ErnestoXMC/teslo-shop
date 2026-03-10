import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class ProductsService {

    private readonly logger = new Logger('ProductsService');

    constructor(

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        private readonly i18nService: I18nService,
    ) { }

    //* Finalizado
    async create(createProductDto: CreateProductDto): Promise<Product> {
        try {
            const producto = this.productRepository.create(createProductDto);
            return await this.productRepository.save(producto);

        } catch (error) {
            await this.handleDBExceptions(error);
            //* Nunca se ejecuta, pero ayuda a inferir a ts que siempre va a retornar un producto o excepcion y nunca undefined
            throw error;
        }
    }

    //TODO: Agregar Paginacion
    async findAll(): Promise<Product[]> {
        const productos: Product[] = await this.productRepository.find({});
        return productos;
    }

    async findOne(id: string): Promise<Product> {

        const producto: Product | null = await this.productRepository.findOneBy({id});

        if(!producto){
            throw new NotFoundException(`No se encontró el producto con el id: ${id}`)
        }

        return producto;
    }

    update(id: number, updateProductDto: UpdateProductDto) {
        return `This action updates a #${id} product`;
    }

    //* Finalizado
    async remove(id: string): Promise<void> {
        try {
            const { affected } = await this.productRepository.delete(id);

            if (affected === 0) {
                throw new NotFoundException(`No se encontró el producto con el id: ${id} `)
            }

        } catch (error) {
            if(error instanceof NotFoundException) throw error;

            console.log(error);
            throw new InternalServerErrorException("No se pudo eliminar el producto");
        }
    }

    private async handleDBExceptions(error: any) {

        const lang = I18nContext.current()?.lang ?? 'es';

        if (error.code === "23505") {

            const match = error.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);

            if (match) {
                const key = match[1];
                const value = match[2];

                const message = await this.i18nService.translate('products.DUPLICATE_KEY_VALUE', {
                    lang,
                    args: { key, value },
                });

                throw new BadRequestException(message);
            }

            const message = await this.i18nService.translate('products.DUPLICATE_RECORD', { lang });
            throw new BadRequestException(message);
        }

        this.logger.error(error);

        const message = await this.i18nService.translate('products.UNEXPECTED_ERROR', { lang });
        throw new InternalServerErrorException(message);
    }
}
