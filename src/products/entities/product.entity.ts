import {  BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";

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

    @PrimaryGeneratedColumn('uuid')
    id: string;

    //* Las columnas son NOT NULL por defecto
    @Column('varchar', {
        unique: true,
        length: 150
    })
    title: string;

    @Column('float', {
        default: 0
    })
    price: number;

    //* Permite nulos
    @Column('text', {
        nullable: true
    })
    description: string;

    @Column('text', {
        unique: true
    })
    slug: string;

    @Column('int', {
        default: 0
    })
    stock: number;

    @Column('text',{
        array: true
    })
    sizes: string[];

    @Column({
        type: 'enum',
        enum: Gender
    })
    gender: Gender;

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[];

    @Column({
        type: 'enum',
        enum: TypeProduct
    })
    type: string;

    @Column('int', {
        default: 1
    })
    isActive: number;
    
    //* Relacion de uno a muchos
    //* 1er campo -> Entidad a quien tenemos la referencia
    //* 2do campo -> Propiedad de la entidad 
    //* 3er campo -> Propiedades de accion en nuestra bd (cascade - agrega y actualiza el valor de las imagenes en su tabla automaticamente), 
    //* eager carga automaticamente nuestras relaciones, evita hacer joins
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];

    //* Relacion con usuario
    @ManyToOne(
        () => User,
        (user) => user.product,
        {eager: true}
    )
    @JoinColumn({name: 'user_id'})
    user: User;

    //* Por defecto toma la fecha actual gracias a los decoradores
    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    //* Se actualiza automaticamente cada que se hace un cambio(save, update)
    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;


    //* Pasos previo a la insercion y actualizacion
    @BeforeInsert()
    @BeforeUpdate()
    sanitizarCampos(){

        //* Title
        this.title = this.title.toLowerCase().trim();

        //* Slug
        if(!this.slug){
            this.slug = this.title;
        }

        this.slug = this.slug.toLowerCase().trim().replaceAll(" ", "_").replaceAll("'", "");

        //* Description
        if(this.description){
            this.description = this.description.trim();
        }
    }



}
