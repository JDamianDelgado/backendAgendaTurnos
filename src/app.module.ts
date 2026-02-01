import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from 'config/supabase';
import { UsersModule } from './users/users.module';
import { TurnosModule } from './turnos/turnos.module';
import { ProfesionalModule } from './profesional/profesional.module';
import { HorariosModule } from './horarios/horarios.module';
import { AuthModule } from './auth/auth.module';
import { MensajesModule } from './mensajes/mensajes.module';
import { ConfigModule } from '@nestjs/config';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
