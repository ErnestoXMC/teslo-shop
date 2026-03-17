import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import {validate as isUUID} from 'uuid';
import { Product, ProductImage } from './entities';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductResponse } from './interfaces/product-response.interface';

@Injectable()
export class ProductsService {

    private readonly logger = new Logger('ProductsService');

    constructor(

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,

        private readonly i18nService: I18nService,
    ) { }

    //* Finalizado
    async create(createProductDto: CreateProductDto): Promise<ProductResponse> {
        try {

            //* Desestructuracion del dto
            const {images = [], ...productProperty} = createProductDto;

            //* Sanitizar nuestros campos
            const imagesSanitizadas: string[] = images.map(i => i.toLowerCase().trim());

            //* Crear el objeto de producto y de product image nest infiere a que tabla insertar mediante el repositorio y el metodo create
            const producto = this.productRepository.create({
                ...productProperty,
                images: imagesSanitizadas.map(img => this.productImageRepository.create({url: img}))
            });
            
            //* Registrar en nuestra bd
            await this.productRepository.save(producto);

            return {...producto, images: imagesSanitizadas};

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

    async update(id: string, updateProductDto: UpdateProductDto): Promise<Product>{
        try {
            //* Busca un registro que concuerde con nuestro id y sobreescribe con los datos que tengamos en updateProductDto 
            const product = await this.productRepository.preload({
                id: id,
                ...updateProductDto,
                images: []
            });

            if(!product) throw new NotFoundException(`El producto con el id: ${id} no ha sido encontrado`);

            return await this.productRepository.save(product);

        } catch (error) {
            if(error instanceof NotFoundException) throw error;

            if(error.code === "23505"){
                console.log(error);
                throw new BadRequestException("No se pudo actualizar el producto, el titulo debe ser único");
            }

            console.log(error); 
            throw new InternalServerErrorException("No se pudo actualizar el producto");
        }
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
