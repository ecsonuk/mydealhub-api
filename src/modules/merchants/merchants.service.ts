import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class MerchantsService {
  constructor(private readonly db: DatabaseService) {}

        async findAll(
          page = 1,
          limit = 20,
          q = '',
	  country = '',
        ) {

    const offset = (page - 1) * limit;
        const searchTerm = `%${q}%`;

        const countResult = await this.db.query(
          `
	SELECT COUNT(DISTINCT m.merchant_id) AS total
	FROM merchants m
	JOIN offers o
	  ON m.merchant_id = o.merchant_id
	WHERE m.visible = true
	  AND m.merchant_name ILIKE $1
	  AND o.is_active = true
	  AND ($2 = '' OR o.country_code = $2)
          `,
          [searchTerm, country],
        );

    const result = await this.db.query(
      `
	SELECT
	  m.merchant_id,
	  m.merchant_name,
	  m.merchant_url,
	  m.logo_url,
	  m.summary,
	  m.currency,
	  m.merchant_estimated_cpc,
	COUNT(o.offer_id)::int AS offer_count
	FROM merchants m
	JOIN offers o
	  ON m.merchant_id = o.merchant_id
	WHERE m.visible = true
	  AND m.merchant_name ILIKE $1
	  AND o.is_active = true
	  AND ($2 = '' OR o.country_code = $2)
	GROUP BY
	  m.merchant_id,
	  m.merchant_name,
	  m.merchant_url,
	  m.logo_url,
	  m.summary,
	  m.currency,
	  m.merchant_estimated_cpc
	ORDER BY m.merchant_name
	LIMIT $3
	OFFSET $4
        `,
      [searchTerm, country, limit, offset,],
    );

    return {
      success: true,
      page,
      limit,
      total: Number(countResult.rows[0].total),
      data: result.rows,
    };
  }

  async findOne(
    merchantId: string,
    page = 1,
    limit = 20,
  ) {

    const offset = (page - 1) * limit;

    const merchantResult = await this.db.query(
      `
      SELECT
        merchant_id,
        merchant_name,
        merchant_url,
        logo_url,
        summary,
        currency,
        merchant_estimated_cpc,
        merchant_tier,
        delivery_countries
      FROM merchants
      WHERE merchant_id = $1
      LIMIT 1
      `,
      [merchantId],
    );

    if (!merchantResult.rows.length) {
      return {
        success: false,
        message: 'Merchant not found',
      };
    }

   const offersCountResult = await this.db.query(
     `
     SELECT COUNT(*) AS total
     FROM offers
     WHERE merchant_id = $1
       AND is_active = true
     `,
     [merchantId],
   );

    const offersResult = await this.db.query(
      `
      SELECT
	offer_id,
	merchant_id,
	country_code,
	title,
        brand_name,
        price,
        rebate_percentage,
        currency,
        image_url,
        tracking_url
      FROM offers
      WHERE merchant_id = $1
        AND is_active = true
      ORDER BY updated_at DESC
	LIMIT $2
	OFFSET $3
      `,
	[
	  merchantId,
	  limit,
	  offset,
	],
    );

	return {
	  success: true,
	  merchant: merchantResult.rows[0],
	  offers: offersResult.rows,
	  page,
	  limit,
	  total: Number(
	    offersCountResult.rows[0].total,
	  ),
};

  }
}
