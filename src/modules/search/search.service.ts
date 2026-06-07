import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SearchService {
  constructor(private readonly db: DatabaseService) {}

  async search(query: string) {
    const searchTerm = `%${query}%`;

    const offersPromise = this.db.query(
      `
      SELECT
        o.offer_id,
	o.merchant_id,
	o.category_id,
	o.country_code,
	o.title,
        o.brand_name,
        o.price,
        o.currency,
        o.image_url,
	o.tracking_url,
        m.merchant_name,
        c.category_name
      FROM offers o
      LEFT JOIN merchants m
        ON o.merchant_id = m.merchant_id
      LEFT JOIN categories c
        ON o.category_id = c.category_id
      WHERE
        o.title ILIKE $1
        OR o.brand_name ILIKE $1
      LIMIT 20
      `,
      [searchTerm],
    );

    const merchantsPromise = this.db.query(
      `
      SELECT
        merchant_id,
        merchant_name,
        logo_url
      FROM merchants
      WHERE merchant_name ILIKE $1
      LIMIT 20
      `,
      [searchTerm],
    );

    const categoriesPromise = this.db.query(
      `
      SELECT
        category_id,
        category_name,
        full_path
      FROM categories
      WHERE category_name ILIKE $1
      LIMIT 20
      `,
      [searchTerm],
    );

    const [
      offers,
      merchants,
      categories,
    ] = await Promise.all([
      offersPromise,
      merchantsPromise,
      categoriesPromise,
    ]);

    return {
      success: true,
      query,
      offers: offers.rows,
      merchants: merchants.rows,
      categories: categories.rows,
    };
  }
}
