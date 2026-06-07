import {
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';

import type { Request } from 'express';
import { ClicksService } from './clicks.service';

@Controller('api/click')
export class ClicksController {
  constructor(
    private readonly clicksService: ClicksService,
  ) {}

  @Post()
  async create(
    @Body() body: any,
    @Req() req: Request,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '';

    const userAgent =
      req.headers['user-agent'] || '';

    return this.clicksService.trackClick(
      body.offer_id,
      body.merchant_id,
      body.category_id,
      body.country_code,
      ip,
      userAgent,
    );
  }
}
