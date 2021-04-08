import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Collection } from './collection';

@Entity()
export class User {
    
    @PrimaryGeneratedColumn()
    public id!: number;

    @OneToMany(() => Collection, collection => collection.user)
    public collections!: Collection[];
}