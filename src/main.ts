import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: ['http://localhost:3000', 'https://pagina-elizabeth.vercel.app/'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Servidor corriendo en el puerto ${process.env.PORT} 👌 `);
}
bootstrap();
