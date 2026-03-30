import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { validate as isUUID } from 'uuid';
import { Product, ProductImage } from './entities';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ProductResponse } from './interfaces/product-response.interface';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProductsService {

    private readonly logger = new Logger('ProductsService');

    constructor(

        @InjectRepository(Product)
        private readonly productRepository: Repository<Product>,

        @InjectRepository(ProductImage)
        private readonly productImageRepository: Repository<ProductImage>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        private readonly i18nService: I18nService,

        private readonly dataSource: DataSource,
    ) { }

    async create(createProductDto: CreateProductDto, user: User): Promise<ProductResponse> {

        // console.log(user)


        try {

            //* Desestructuracion del dto
            const { images = [], ...productProperty } = createProductDto;

            //* Sanitizar nuestros campos
            const imagesTransform: string[] = images.map(i => i.toLowerCase().trim());

            //* Crear el objeto de producto y de product image nest infiere a que tabla insertar mediante el repositorio y el metodo create
            const producto = this.productRepository.create({
                ...productProperty,
                images: imagesTransform.map(img => this.productImageRepository.create({ url: img })),
                user
            });

            //* Registrar en nuestra bd
            await this.productRepository.save(producto);

            return { ...producto, images: imagesTransform };

        } catch (error) {
            await this.handleDBExceptions(error);
            //? Nunca se ejecuta, pero ayuda a inferir a ts que siempre va a retornar un producto o excepcion y nunca undefined
            throw error;
        }
    }

    //* Sin parametros me trae todos los registros sin importar si estan activos o no
    //! Es recomendable siempre hacer peticiones con los query parametros
    async findAll(paginationDto: PaginationDto): Promise<ProductResponse[]> {

        const { limit = 10, offset = 0, isActive } = paginationDto;

        //* Objeto para paginacion
        const findOptions: any = {
            take: limit,
            skip: offset,
            order: {
                createdAt: 'DESC'
            }
        }

        //* Validamos el tipo de isActive y de acuerdo a ello hacemos la condicion
        if (typeof isActive !== 'undefined' && isActive !== null) {
            findOptions.where = { isActive };
        }

        const productos: Product[] = await this.productRepository.find(findOptions);

        const productsResponse: ProductResponse[] = productos.map(producto => {
            return this.transformProductResponse(producto);
        });

        return productsResponse;
    }

    async findOne(term: string): Promise<ProductResponse> {

        term = term.toLowerCase().trim();

        let producto: Product | null = null;

        if (isUUID(term)) {
            producto = await this.productRepository.findOne({
                where: { id: term }
            });
        } else {
            producto = await this.productRepository.findOne({
                where: { slug: term }
            })
        }

        if (!producto) {
            throw new NotFoundException(`No se encontró el producto con el termino de búsqueda: ${term}`)
        }

        const productResponse = this.transformProductResponse(producto);

        return productResponse;
    }

    async update(id: string, updateProductDto: UpdateProductDto, user: User): Promise<ProductResponse> {

        const { images, ...propertiesUpdateDto } = updateProductDto;

        //* Busca un registro que concuerde con nuestro id y sobreescribe con los datos que tengamos en propertiesUpdateDto sin images
        const product = await this.productRepository.preload({
            id,
            ...propertiesUpdateDto
        });

        if (!product) throw new NotFoundException(`El producto con el id: ${id} no ha sido encontrado`);

        //* Creacion de queryRunner (permite realizar transacciones)
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            if (images) {
                //* Eliminamos las imagenes previas, mediante el id del producto
                await queryRunner.manager.delete(ProductImage, { product: { id } });
                //* Ingresamos las nuevas imagenes a nuestro obj
                product.images = images.map(image => this.productImageRepository.create({ url: image }));
            } else {
                //* Obtenemos las imagenes previas 
                product.images = await this.productImageRepository.findBy({ product: { id } })
            }

            product.user = user

            //* Guardamos los cambios y finalizamos la transaccion
            await queryRunner.manager.save(product);
            await queryRunner.commitTransaction();

            return this.transformProductResponse(product);

        } catch (error) {
            await queryRunner.rollbackTransaction();

            if (error.code === "23505") {
                console.log(error);
                throw new BadRequestException("No se pudo actualizar el producto, el titulo debe ser único");
            }

            console.log(error);
            throw new InternalServerErrorException("No se pudo actualizar el producto");
        } finally {
            //* Liberamos siempre la conexion
            await queryRunner.release();
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const { affected } = await this.productRepository.delete(id);

            if (affected === 0) {
                throw new NotFoundException(`No se encontró el producto con el id: ${id} `)
            }

        } catch (error) {
            if (error instanceof NotFoundException) throw error;

            console.log(error);
            throw new InternalServerErrorException("No se pudo eliminar el producto");
        }
    }

    async deleteAll(): Promise<void> {
        if (process.env.NODE_ENV === "production") {
            throw new InternalServerErrorException("Método eliminar todos los productos no permitido en producción");
        }
        try {
            await this.productRepository.deleteAll();
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException("No se pudo eliminar todos los productos");
        }
    }

    async createAll(productsSeed): Promise<ProductResponse[]> {
        try {
            const productosToSave = productsSeed.map(productSeed => {
                const { images = [], ...productProperty } = productSeed;
                const imagesTransform = images.map(i => i.toLowerCase().trim());

                return this.productRepository.create({
                    ...productProperty,
                    images: imagesTransform.map(img => this.productImageRepository.create({ url: img }))
                });
            });

            const savedProducts = await this.productRepository.save(productosToSave);

            return savedProducts.map(producto => ({
                ...producto,
                images: producto.images?.map(img => img.url) ?? []
            }));

        } catch (error) {
            await this.handleDBExceptions(error);
            throw error;
        }
    }


    //* Metodo para transformar la respuesta de nuestras peticiones
    private transformProductResponse(producto: Product): ProductResponse {
        const { images = [], ...productProperties } = producto;

        const imagesTransform: string[] = images.map(i => i.url);

        return { ...productProperties, images: imagesTransform };
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
