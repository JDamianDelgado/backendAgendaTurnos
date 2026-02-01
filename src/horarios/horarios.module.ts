import { Module } from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { HorariosController } from './horarios.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Horarios } from './entities/horario.entity';
import { Profesional } from 'src/profesional/entities/profesional.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Horarios, Profesional, User])],
  controllers: [HorariosController],
  providers: [HorariosService],
})
export class HorariosModule {}
