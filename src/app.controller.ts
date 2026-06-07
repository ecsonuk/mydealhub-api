import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller()
export class AppController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async health() {
    const result = await this.db.query(
      'SELECT COUNT(*) AS count FROM categories',
    );

    return {
      status: 'ok',
      categories: result.rows[0].count,
    };
  }
}
