import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/supabase';
import { UsersModule } from './users/users.module';
import { TurnosModule } from './turnos/turnos.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { HorariosModule } from './horarios/horarios.module';
import { AuthModule } from './auth/auth.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './PRUEBA/app.controller';
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
    AppModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
