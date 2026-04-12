import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ShareholdingPattern } from './shareholding-pattern.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nseSymbol: string;

  @Column({ nullable: true })
  bseCode: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  isin: string;

  @Column({ nullable: true })
  sector: string;

  @OneToMany(() => ShareholdingPattern, (pattern) => pattern.company)
  patterns: ShareholdingPattern[];

  @CreateDateColumn()
  createdAt: Date;
}
