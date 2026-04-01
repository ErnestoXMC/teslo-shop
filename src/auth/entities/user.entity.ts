import { ApiProperty } from "@nestjs/swagger";
import { Product } from "src/products/entities";
import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {

    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column('text', {
        name: 'full_name'
    })
    fullName: string;

    @ApiProperty()
    @Column('varchar', {
        length: 250,
        unique: true
    })
    email: string;

    @ApiProperty()
    @Column('text', {
        select: false
    })
    password: string;

    @ApiProperty()
    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @ApiProperty()
    @Column('bool', {
        default: true
    })
    isActive: boolean;

    //* Relacion con productos
    @OneToMany(
        () => Product,
        (product) => product.user,
        
    )
    product: Product;

    @ApiProperty()
    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date;

    @BeforeInsert()
    @BeforeUpdate()
    sanitizarCampos() {
        this.fullName = this.fullName.toLowerCase().trim();
        this.email = this.email.toLowerCase().trim();
        this.password = this.password.trim();
    }

}