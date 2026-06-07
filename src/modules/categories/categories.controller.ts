import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('api/categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

	@Get()
	async findAll(
	  @Query('page') page?: string,
	  @Query('limit') limit?: string,
	  @Query('q') q?: string,
	  @Query('group') group?: string,
	  @Query('country') country?: string,
  ) {
    const pageNumber = Number(page || 1);
    const limitNumber = Number(limit || 20);
	return this.categoriesService.findAll(
	  pageNumber,
	  limitNumber,
	  q || '',
	  group || '',
	  country === 'ALL'
	    ? ''
	    : country || '',
	);
  }

  @Get('groups')
  async getGroups() {
    return this.categoriesService.getGroups();
  }

  @Get(':categoryId/offers')
  async findOffers(
    @Param('categoryId') categoryId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = Number(page || 1);
    const limitNumber = Number(limit || 20);

    return this.categoriesService.findOffers(
      categoryId,
      pageNumber,
      limitNumber,
    );
  }
}
