import { Controller, Get } from '@nestjs/common';
import { CountriesService } from './countries.service';

@Controller('api/countries')
export class CountriesController {
  constructor(
    private readonly countriesService: CountriesService,
  ) {}

  @Get()
  async findAll() {
    const countries =
      await this.countriesService.findAll();

    return {
      success: true,
      countries,
    };
  }
}
