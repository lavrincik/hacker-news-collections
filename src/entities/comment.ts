import { Entity, ManyToOne, PrimaryColumn, Column } from 'typeorm';
import { Story } from "./story";

@Entity()
export class Comment {
    
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
    public text!: string | null;

    @Column({ 
        type: 'varchar', 
        nullable: true 
    })
    public author!: string | null;

    @ManyToOne(() => Story, story => story.comments)
    public story!: Story;
}
