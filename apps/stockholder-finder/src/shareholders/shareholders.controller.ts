import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ShareholdersService } from './shareholders.service';
import { Shareholder } from '@app/database/entities/shareholder.entity';

@Controller('shareholders')
export class ShareholdersController {
  constructor(private readonly shareholdersService: ShareholdersService) {}

  @Get(':id')
  async getShareholder(@Param('id', ParseUUIDPipe) id: string): Promise<Shareholder> {
    return this.shareholdersService.findOneWithHoldings(id);
  }
}
