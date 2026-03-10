import {  BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum Gender {
    MEN = 'men',
    WOMEN = 'women',
    UNISEX = 'unisex',
    KID = 'kid'
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

    @Column('int', {
        default: 1
    })
    isActive: number;

    //* Por defecto toma la fecha actual gracias a los decoradores
    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    //* Se actualiza automaticamente cada que se hace un cambio(save, update)
    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;

    //TODO Agregar campos restantes
    // TAGS

    // IMAGES

    //* Pasos previo a la insercion
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
