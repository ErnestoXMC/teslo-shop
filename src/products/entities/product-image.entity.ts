import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('product_images')
export class ProductImage {

    //* Por defecto autoincrementable
    @PrimaryGeneratedColumn()
    id: number;

    @Column('text')
    url: string;

    //* Relacion de muchos a uno
    @ManyToOne(
        () => Product,
        product => product.images,
        {onDelete: 'CASCADE'}
    )
    //* Cambiamos el nombre de nuestro campo solo en caso de relaciones
    @JoinColumn({name: 'product_id'})
    product: Product;
}