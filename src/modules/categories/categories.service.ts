import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(
    page = 1,
    limit = 20,
    q = '',
    group = '',
    country = '',
  ) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${q}%`;
    const groupFilter = `${group}%`;

    const countResult = await this.db.query(
      `
      SELECT COUNT(*) AS total
      FROM categories
      WHERE category_name ILIKE $1
      AND ($2 = '' OR full_path ILIKE $2)
      `,
      [searchTerm, groupFilter]
    );

	const result = await this.db.query(
	  `
	  SELECT
	  c.category_id,
	  c.category_name,
	  c.level_no,
	  c.full_path,
	  COUNT(o.offer_id) AS offer_count
	FROM categories c
	LEFT JOIN offers o
	  ON c.category_id = o.category_id
	 AND o.is_active = true
	 AND ($3 = '' OR o.country_code = $3)
	WHERE c.category_name ILIKE $1
	AND ($2 = '' OR c.full_path ILIKE $2)
	GROUP BY
	  c.category_id,
	  c.category_name,
	  c.level_no,
	  c.full_path
	ORDER BY
	  c.category_name ASC
	LIMIT $4
	OFFSET $5
	  `,
	  [searchTerm, groupFilter, country, limit, offset],
	);

    return {
      success: true,
      page,
      limit,
      total: Number(countResult.rows[0].total),
      data: result.rows,
    };
  }

  async getGroups() {
    const result = await this.db.query(`
	SELECT DISTINCT
	  SPLIT_PART(full_path, ' > ', 1) AS group_name
	FROM categories
	WHERE full_path IS NOT NULL
	  AND full_path <> ''
	ORDER BY group_name ASC
    `);

    return {
      success: true,
      groups: result.rows.map(
        (row) => row.group_name,
      ),
    };
  }


  async findOffers(
    categoryId: string,
    page = 1,
    limit = 20,
  ) {
    const offset = (page - 1) * limit;

    const categoryResult = await this.db.query(
      `
      SELECT
        category_id,
        category_name,
        full_path
      FROM categories
      WHERE category_id = $1
      LIMIT 1
      `,
      [categoryId],
    );

    if (!categoryResult.rows.length) {
      return {
        success: false,
        message: 'Category not found',
      };
    }

    const countResult = await this.db.query(
      `
      SELECT COUNT(*) AS total
      FROM offers
      WHERE category_id = $1
        AND is_active = true
      `,
      [categoryId],
    );

    const offersResult = await this.db.query(
      `
      SELECT
        o.offer_id,
	o.category_id,
	o.merchant_id,
	o.country_code,
	o.title,
        o.brand_name,
        o.price,
        o.currency,
        o.image_url,
        o.tracking_url,
        m.merchant_name
      FROM offers o
      LEFT JOIN merchants m
        ON o.merchant_id = m.merchant_id
      WHERE o.category_id = $1
        AND o.is_active = true
      ORDER BY o.updated_at DESC
      LIMIT $2
      OFFSET $3
      `,
      [categoryId, limit, offset],
    );

    return {
      success: true,
      page,
      limit,
      total: Number(countResult.rows[0].total),
      category: categoryResult.rows[0],
      offers: offersResult.rows,
    };
  }
}
