import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn, ManyToMany } from 'typeorm';
import { Collection } from "./collection";
import { Comment } from './comment';

@Entity()
export class Story {
    
    @PrimaryColumn()
    public id!: number;

    @Column({ 
        type: "bigint",
        nullable: true
    })
    public time!: number | null;

    @Column({ 
        type: 'varchar', 
        nullable: true 
    })
    public title!: string | null;

    @Column({ 
        type: 'varchar', 
        nullable: true 
    })
    public author!: string | null;

    @ManyToMany(() => Collection, collection => collection.stories)
    public collections!: Collection[];

    @OneToMany(() => Comment, comment => comment.story)
    public comments!: Comment[];
}