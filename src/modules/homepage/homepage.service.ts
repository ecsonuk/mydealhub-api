import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class HomepageService {
  constructor(private readonly db: DatabaseService) {}

	async getHomepageData(
	  country = '',
	) {
    console.log('COUNTRY FILTER =', country);
    const featuredOffersPromise = this.db.query(`
      SELECT
        o.offer_id,
        o.merchant_id,
	o.category_id,
        o.title,
	o.country_code,
        o.price,
        o.currency,
        o.image_url,
        m.merchant_name,
	o.tracking_url,
        c.category_name
      FROM offers o
      LEFT JOIN merchants m
        ON o.merchant_id = m.merchant_id
      LEFT JOIN categories c
        ON o.category_id = c.category_id
      WHERE o.is_active = true AND ($1 = '' OR o.country_code = $1)
      ORDER BY o.estimated_cpc DESC NULLS LAST
      LIMIT 20
    `, [country]);

    const topDiscountsPromise = this.db.query(`
      SELECT
        o.offer_id,
        o.merchant_id,
	o.category_id,
        o.title,
	o.country_code,
        o.price,
        o.rebate_percentage,
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
      WHERE o.is_active = true AND ($1 = '' OR o.country_code = $1) AND o.rebate_percentage IS NOT NULL
        AND o.rebate_percentage IS NOT NULL
      ORDER BY o.rebate_percentage DESC
      LIMIT 20
    `, [country]);

   const topSavingsPromise = this.db.query(`
     SELECT
       o.offer_id,
       o.merchant_id,
       o.category_id,
       o.title,
       o.country_code,
       o.price,
       o.price_without_rebate,
       o.rebate_percentage,
       o.currency,
       o.image_url,
       o.tracking_url,
       m.merchant_name
     FROM offers o
     LEFT JOIN merchants m
       ON o.merchant_id = m.merchant_id
     WHERE o.is_active = true AND ($1 = '' OR o.country_code = $1)
       AND o.price_without_rebate IS NOT NULL
       AND o.price IS NOT NULL
     ORDER BY
       (o.price_without_rebate - o.price) DESC
     LIMIT 20
   `, [country]);

	const exclusiveOffersPromise = this.db.query(`
	  SELECT
	    o.offer_id,
	    o.merchant_id,
	    o.category_id,
	    o.title,
	    o.country_code,
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
	    o.is_active = true
	    AND ($1 = '' OR o.country_code = $1)
	  ORDER BY
	    o.estimated_cpc DESC NULLS LAST
	  LIMIT 20
	`, [country]);

    const featuredMerchantsPromise = this.db.query(`
      SELECT
        merchant_id,
        merchant_name,
        logo_url,
        merchant_estimated_cpc,
        merchant_tier
      FROM merchants
      WHERE visible = true
      ORDER BY merchant_estimated_cpc DESC NULLS LAST
      LIMIT 20
    `);

	const topBrandsPromise = this.db.query(`
	  SELECT
	    m.merchant_id,
	    m.merchant_name,
	    m.logo_url,
	    COUNT(o.offer_id) AS offer_count
	  FROM merchants m
	  JOIN offers o
	    ON m.merchant_id = o.merchant_id
	  WHERE
	    m.visible = true
	    AND o.is_active = true
	    AND ($1 = '' OR o.country_code = $1)
	  GROUP BY
	    m.merchant_id,
	    m.merchant_name,
	    m.logo_url
	  ORDER BY
	    offer_count DESC
	  LIMIT 20
	`, [country]);

    const popularCategoriesPromise = this.db.query(`
      SELECT
        c.category_id,
        c.category_name,
        COUNT(o.offer_id) AS offer_count
      FROM categories c
      JOIN offers o
        ON c.category_id = o.category_id
      WHERE o.is_active = true AND ($1 = '' OR o.country_code = $1)
      GROUP BY c.category_id, c.category_name
      ORDER BY offer_count DESC
      LIMIT 20
    `, [country]);

    const latestOffersPromise = this.db.query(`
      SELECT
        o.offer_id,
        o.merchant_id,
	o.category_id,
        o.title,
	o.country_code,
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
      WHERE o.is_active = true AND ($1 = '' OR o.country_code = $1)
      ORDER BY o.created_at DESC
      LIMIT 20
    `, [country]);

	const statsPromise = this.db.query(`
	  SELECT
	    (SELECT COUNT(*) FROM offers WHERE is_active = true) AS offers,
	    (SELECT COUNT(DISTINCT m.merchant_id)  FROM merchants m  JOIN offers o ON m.merchant_id = o.merchant_id  WHERE m.visible = true AND o.is_active = true) AS merchants,
	    (SELECT COUNT(*) FROM categories) AS categories,
	    (SELECT COUNT(DISTINCT country_code) FROM offers WHERE is_active = true) AS countries
	`);

     const [
	featuredOffers,
	topDiscounts,
	topSavings,
	exclusiveOffers,
	featuredMerchants,
	topBrands,
	popularCategories,
	latestOffers,
	stats,
    ] = await Promise.all([
	featuredOffersPromise,
 	topDiscountsPromise,
	topSavingsPromise,
	exclusiveOffersPromise,
	featuredMerchantsPromise,
	topBrandsPromise,
	popularCategoriesPromise,
	latestOffersPromise,
	statsPromise,
    ]);

    return {
      success: true,
      stats: stats.rows[0],
      featuredOffers: featuredOffers.rows,
      topDiscounts: topDiscounts.rows,
      topSavings: topSavings.rows,
      exclusiveOffers: exclusiveOffers.rows,
      featuredMerchants: featuredMerchants.rows,
      topBrands: topBrands.rows,
      popularCategories: popularCategories.rows,
      latestOffers: latestOffers.rows,
    };
  }
}
