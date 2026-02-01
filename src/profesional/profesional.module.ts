import { Module } from '@nestjs/common';
import { ProfesionalService } from './profesional.service';
import { ProfesionalController } from './profesional.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profesional } from './entities/profesional.entity';
import { Turnos } from 'src/turnos/entities/turno.entity';
import { Horarios } from 'src/horarios/entities/horario.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profesional, Turnos, Horarios, User])],
  controllers: [ProfesionalController],
  providers: [ProfesionalService],
})
export class ProfesionalModule {}
