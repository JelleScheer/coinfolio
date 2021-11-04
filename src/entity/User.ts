import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column('timestamp')
    createdAt: string;

    @Column('timestamp')
    updatedAt: string;

    @Column({
      type: 'timestamp',
      nullable: true,
    })
    deletedAt: string;
}
