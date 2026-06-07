import {
  Controller,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common';

import { SearchService } from './search.service';

@Controller('api/search')
export class SearchController {
  constructor(
    private readonly searchService: SearchService,
  ) {}

  @Get()
  async search(
    @Query('q') q?: string,
  ) {
    if (!q || q.trim().length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters',
      );
    }

    return this.searchService.search(q.trim());
  }
}
