import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import {validate as isUUID} from 'uuid';

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
            //? Nunca se ejecuta, pero ayuda a inferir a ts que siempre va a retornar un producto o excepcion y nunca undefined
            throw error;
        }
    }

    //* Sin parametros me trae todos los registros sin importar si estan activos o no
    //! Es recomendable siempre hacer peticiones con los query parametros
    async findAll(paginationDto: PaginationDto): Promise<Product[]> {

        const {limit = 10, offset = 0, isActive} = paginationDto;

        //* Objeto para paginacion
        const findOptions: any = {
            take: limit,
            skip: offset,
            order: {
                createdAt: 'DESC'
            }
        }

        //* Validamos el tipo de isActive y de acuerdo a ello hacemos la condicion
        if(typeof isActive !== 'undefined' && isActive !== null){
            findOptions.where = {isActive};
        }

        const productos: Product[] = await this.productRepository.find(findOptions);

        return productos;
    }

    async findOne(term: string): Promise<Product> {

        term = term.toLowerCase().trim();

        let producto: Product | null = null;

        if(isUUID(term)){
            producto = await this.productRepository.findOneBy({id: term});
        } else {
            // producto = await this.productRepository.findOneBy({slug: term});
            //* Usando queryBuilder (preferible usarlo en consultas complejas)
            producto = await this.productRepository.createQueryBuilder()
            .where('slug =:slug', {
                slug: term
            })
            .getOne();;
        }

        if(!producto){
            throw new NotFoundException(`No se encontró el producto con el term: ${term}`)
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
