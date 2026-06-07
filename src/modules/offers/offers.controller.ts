import {
  Controller,
  Get,
  Query,
  Param,
} from '@nestjs/common';

import { OffersService } from './offers.service';

@Controller('api/offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('country') country?: string,
  ) {
    return this.offersService.findAll(
      Number(page),
      Number(limit),
      country,
    );
  }
  @Get(':offerId')
  async findOne(
    @Param('offerId') offerId: string,
  ) {
    return this.offersService.findOne(offerId);
}
}
