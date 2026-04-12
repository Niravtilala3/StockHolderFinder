import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Holding } from './holding.entity';

@Entity('shareholding_patterns')
export class ShareholdingPattern {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, (company) => company.patterns)
  company: Company;

  @Column()
  companyId: string;

  @Column()
  quarter: string; // Q1, Q2, Q3, Q4

  @Column('int')
  year: number;

  @Column('date', { nullable: true })
  filingDate: Date;

  @Column('bigint', { nullable: true })
  totalSharesOutstanding: string;

  @Column({ nullable: true })
  documentUrl: string; // MinIO path

  @OneToMany(() => Holding, (holding) => holding.pattern)
  holdings: Holding[];

  @CreateDateColumn()
  createdAt: Date;
}
