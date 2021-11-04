import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export default class Holding {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('int')
    coinId: number;

    @Column('double')
    amount: number;

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
