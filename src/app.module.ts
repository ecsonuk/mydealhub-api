import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { CountriesModule } from './modules/countries/countries.module';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { OffersModule } from './modules/offers/offers.module';
import { HomepageModule } from './modules/homepage/homepage.module';
import { SearchModule } from './modules/search/search.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { ClicksModule } from './modules/clicks/clicks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    CategoriesModule,
    OffersModule,
    HomepageModule,
    SearchModule,
    MerchantsModule,
    ClicksModule,
    CountriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
