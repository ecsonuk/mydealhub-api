import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { HomepageService } from './homepage.service';

@Controller('api/homepage')
export class HomepageController {
  constructor(
    private readonly homepageService: HomepageService,
  ) {}

  @Get()
  async getHomepage(
    @Query('country') country = '',
  ) {
    return this.homepageService.getHomepageData(
      country,
    );
  }
}
