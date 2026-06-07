import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class ClicksService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async trackClick(
    offerId: number,
    merchantId: number,
    categoryId: number,
    countryCode: string,
    visitorIp: string,
    userAgent: string,
  ) {
    await this.databaseService.query(
      `
      INSERT INTO click_tracking (
        offer_id,
        merchant_id,
        category_id,
        country_code,
        visitor_ip,
        user_agent,
        clicked_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,NOW())
      `,
      [
        offerId,
        merchantId,
        categoryId,
        countryCode,
        visitorIp,
        userAgent,
      ],
    );

    return {
      success: true,
    };
  }
}
