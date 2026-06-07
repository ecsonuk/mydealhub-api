import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class CountriesService {
  constructor(
    private readonly db: DatabaseService,
  ) {}

  async findAll() {
    const result = await this.db.query(`
      SELECT
        country_code,
        COUNT(*) AS offer_count
      FROM offers
      WHERE is_active = true
      GROUP BY country_code
      ORDER BY country_code
    `);

    const countryMap: Record<
      string,
      string
    > = {
      UK: 'United Kingdom',
      DE: 'Germany',
      FR: 'France',
    };

    return result.rows.map((row) => ({
      code: row.country_code,
      name:
        countryMap[row.country_code] ??
        row.country_code,
      offerCount: Number(
        row.offer_count,
      ),
    }));
  }
}
