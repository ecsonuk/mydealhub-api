import { Controller, Get, Param, Query } from '@nestjs/common';
import { MerchantsService } from './merchants.service';

@Controller('api/merchants')
export class MerchantsController {
  constructor(
    private readonly merchantsService: MerchantsService,
  ) {}

@Get()
async findAll(
  @Query('page') page = '1',
  @Query('limit') limit = '20',
  @Query('q') q = '',
  @Query('country') country = '',
) {

  // Handle All Countries
  if (country === 'ALL') {
    country = '';
  }

  return this.merchantsService.findAll(
    Number(page),
    Number(limit),
    q,
    country,
  );
}

  @Get(':merchantId')
  async findOne(
    @Param('merchantId') merchantId: string,
  ) {
    return this.merchantsService.findOne(
      merchantId,
    );
  }
}
