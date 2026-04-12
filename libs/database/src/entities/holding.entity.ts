import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ShareholdingPattern } from './shareholding-pattern.entity';
import { Shareholder } from './shareholder.entity';

@Entity('holdings')
export class Holding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ShareholdingPattern, (pattern) => pattern.holdings)
  pattern: ShareholdingPattern;

  @Column()
  patternId: string;

  @ManyToOne(() => Shareholder, (shareholder) => shareholder.holdings)
  shareholder: Shareholder;

  @Column()
  shareholderId: string;

  @Column('bigint')
  numberOfShares: string;

  @Column('decimal', { precision: 5, scale: 2 })
  percentage: number;

  @Column({ default: false })
  isPromoterGroup: boolean;
}
