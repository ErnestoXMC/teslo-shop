import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

export enum Gender {
    MEN = 'men',
    WOMEN = 'women',
    UNISEX = 'unisex',
    KID = 'kid'
}

export enum TypeProduct {
    SHIRTS = 'shirts',
    PANTS = 'pants',
    HOODIES = 'hoodies',
    HATS = 'hats'
}

@Entity('products')
export class Product {

    @ApiProperty({
        example: "b0ec8a75-6585-44f5-8f42-8df90e9d411b",
        description: "Id del Producto",
        uniqueItems: true,
        required: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    //* Las columnas son NOT NULL por defecto
    @ApiProperty({
        example: "Polo Azul Oversize",
        description: "Titulo del Producto",
        uniqueItems: true,
        maxLength: 150,
        required: true
    })
    @Column('varchar', {
        unique: true,
        length: 150
    })
    title: string;

    @ApiProperty({
        example: 99.90,
        description: "Precio del Producto",
        default: 0,
        required: false
    })
    @Column('float', {
        default: 0,
        scale: 2,      // De los cuales 2 son decimales (ej: 99999999.99)
    })
    price: number;

    //* Permite nulos
    @ApiProperty({
        example: "Producto en oferta de verano",
        description: "Descripción del Producto",
        nullable: true,
        required: false
    })
    @Column('text', {
        nullable: true
    })
    description: string;

    @ApiProperty({
        example: "polo_azul_oversize",
        description: "Slug del Producto",
        uniqueItems: true
    })
    @Column('text', {
        unique: true
    })
    slug: string;

    @ApiProperty({
        example: 100,
        description: "Stock del Producto",
        default: 0,
        required: false
    })
    @Column('int', {
        default: 0
    })
    stock: number;

    @ApiProperty({
        example: ["S", "M", "L", "XL"],
        description: "Tallas del Producto",
        isArray: true
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: "men",
        description: "Genero del Producto",
        enum: Gender
    })
    @Column({
        type: 'enum',
        enum: Gender
    })
    gender: Gender;

    @ApiProperty({
        example: ["Azul", "Degradado", "Oferta"],
        description: "Tags del Producto",
        default: [],
        required: false,
        isArray: true
    })
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @ApiProperty({
        example: "shirts",
        description: "Tipo - Categoria del Producto",
        enum: TypeProduct
    })
    @Column({
        type: 'enum',
        enum: TypeProduct
    })
    type: string;

    @ApiProperty({
        example: 1,
        description: "Estado del Producto",
        default: 1,
        required: false
    })
    @Column('int', {
        default: 1
    })
    isActive: number;

    //* Relacion de uno a muchos
    //* 1er campo -> Entidad a quien tenemos la referencia
    //* 2do campo -> Propiedad de la entidad 
    //* 3er campo -> Propiedades de accion en nuestra bd (cascade - agrega y actualiza el valor de las imagenes en su tabla automaticamente), 
    //* eager carga automaticamente nuestras relaciones, evita hacer joins
    @ApiProperty({
        example: ['https://image1.jpg', 'https://image2.jpg'],
        description: 'Arreglo de URLs de las imágenes del producto',
        type: [String] // Le decimos que es un arreglo de strings
    })
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[];

    //* Relacion con usuario
    @ApiProperty({
        description: 'Usuario que registró el producto',
        type: () => User // Usamos una función flecha para evitar dependencias circulares
    })
    @ManyToOne(
        () => User,
        (user) => user.product,
        { eager: true }
    )
    @JoinColumn({ name: 'user_id' })
    user: User;

    //* Por defecto toma la fecha actual gracias a los decoradores
    @ApiProperty()
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    //* Se actualiza automaticamente cada que se hace un cambio(save, update)
    @ApiProperty()
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;


    //* Pasos previo a la insercion y actualizacion
    @BeforeInsert()
    @BeforeUpdate()
    sanitizarCampos() {

        //* Title
        this.title = this.title.toLowerCase().trim();

        //* Slug
        if (!this.slug) {
            this.slug = this.title;
        }

        this.slug = this.slug.toLowerCase().trim().replaceAll(" ", "_").replaceAll("'", "");

        //* Description
        if (this.description) {
            this.description = this.description.trim();
        }
    }



}
