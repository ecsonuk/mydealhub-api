import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class OffersService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(
    page = 1,
    limit = 20,
    country?: string,
  ) {
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE o.is_active = true';
    const params: any[] = [];

    if (country) {
      params.push(country.toUpperCase());
      whereClause += ` AND o.country_code = $${params.length}`;
    }

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM offers o
      ${whereClause}
    `;

    const countResult = await this.db.query(
      countQuery,
      params,
    );

    params.push(limit);
    params.push(offset);

    const offersQuery = `
      SELECT
        o.offer_id,
        o.title,
        o.brand_name,
        o.price,
        o.rebate_percentage,
        o.currency,
        o.image_url,
        o.tracking_url,
        o.country_code,

        o.merchant_id,
        m.merchant_name,

        o.category_id,
        c.category_name

      FROM offers o

      LEFT JOIN merchants m
        ON o.merchant_id = m.merchant_id

      LEFT JOIN categories c
        ON o.category_id = c.category_id

      ${whereClause}

      ORDER BY o.updated_at DESC

      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const offersResult = await this.db.query(
      offersQuery,
      params,
    );

    return {
      success: true,
      page,
      limit,
      total: Number(countResult.rows[0].total),
      data: offersResult.rows,
    };
  }

  async findOne(offerId: string) {
    const result = await this.db.query(
      `
      SELECT
        o.offer_id,
        o.title,
        o.brand_name,
        o.price,
        o.rebate_percentage,
        o.currency,
        o.image_url,
        o.tracking_url,
        o.country_code,

        o.merchant_id,
        m.merchant_name,

        o.category_id,
        c.category_name

      FROM offers o

      LEFT JOIN merchants m
        ON o.merchant_id = m.merchant_id

      LEFT JOIN categories c
        ON o.category_id = c.category_id

      WHERE o.offer_id = $1

      LIMIT 1
      `,
      [offerId],
    );

    return {
      success: true,
      data: result.rows[0] || null,
    };
  }
}
