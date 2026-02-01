import { Module } from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { TurnosController } from './turnos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turnos } from './entities/turno.entity';
import { Profesional } from 'src/profesional/entities/profesional.entity';
import { User } from 'src/users/entities/user.entity';
import { MailModule } from 'src/nodemailer/nodemailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([Turnos, Profesional, User]), MailModule],
  controllers: [TurnosController],
  providers: [TurnosService],
})
export class TurnosModule {}
