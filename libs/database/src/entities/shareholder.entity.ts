import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Holding } from './holding.entity';

@Entity('shareholders')
export class Shareholder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  normalizedName: string; // e.g., "MUKESH D AMBANI"

  @Column()
  category: string; // FII, DII, Promoter, Public

  @OneToMany(() => Holding, (holding) => holding.shareholder)
  holdings: Holding[];

  @CreateDateColumn()
  createdAt: Date;
}
