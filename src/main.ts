import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

console.log('MAIN DATABASE_URL=', process.env.DATABASE_URL);
console.log('ALL ENV KEYS=', Object.keys(process.env).filter(k => k.includes('DATABASE')));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend access
  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);

  console.log(
    `🚀 MyDealHub API running on port ${process.env.PORT ?? 3000}`,
  );
}

bootstrap();
