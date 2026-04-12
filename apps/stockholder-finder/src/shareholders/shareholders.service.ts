import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shareholder } from '@app/database/entities/shareholder.entity';

@Injectable()
export class ShareholdersService {
  constructor(
    @InjectRepository(Shareholder)
    private shareholderRepository: Repository<Shareholder>,
  ) {}

  async findOneWithHoldings(id: string): Promise<Shareholder> {
    const shareholder = await this.shareholderRepository.findOne({
      where: { id },
      relations: { holdings: { company: true } },
    });
    if (!shareholder) {
      throw new NotFoundException(`Shareholder with ID ${id} not found`);
    }
    return shareholder;
  }
}
