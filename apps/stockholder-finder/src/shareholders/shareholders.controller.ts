import { Controller, Get, Param } from '@nestjs/common';
import { ShareholdersService } from './shareholders.service';

@Controller('shareholders')
export class ShareholdersController {
  constructor(private readonly shareholdersService: ShareholdersService) {}

  @Get(':id')
  async getShareholder(@Param('id') id: string) {
    return this.shareholdersService.findOneWithHoldings(id);
  }
}
