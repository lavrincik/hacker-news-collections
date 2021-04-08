import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from './user';
import { Story } from './story';

@Entity()
export class Collection {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public name!: string;

    @ManyToOne(() => User, user => user.collections)
    public user!: User;

    @ManyToMany(() => Story, story => story.collections)
    @JoinTable()
    public stories!: Story[];
}