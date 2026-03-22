import { BeforeInsert, BeforeUpdate, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('text', {
        name: 'full_name'
    })
    fullName: string;

    @Column('varchar', {
        length: 250,
        unique: true
    })
    email: string;

    @Column('text', {
        select: false
    })
    password: string;

    @Column('text', {
        array: true,
        default: ['user']
    })
    roles: string[];

    @Column('bool', {
        default: true
    })
    isActive: boolean;

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date;

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