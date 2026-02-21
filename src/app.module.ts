import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/supabase';
import { UsersModule } from './users/users.module';
import { TurnosModule } from './turnos/turnos.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { HorariosModule } from './horarios/horarios.module';
import { AuthModule } from './auth/auth.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerMiddleware } from './logger/logger.middleware';
import { ConversacionModule } from './conversacion/conversacion.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(typeOrmConfig),
    UsersModule,
    TurnosModule,
    ProfesionalModule,
    HorariosModule,
    AuthModule,
    MensajesModule,
    ConversacionModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
