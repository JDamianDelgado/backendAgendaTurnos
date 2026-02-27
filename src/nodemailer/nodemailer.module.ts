import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Turnos } from 'src/turnos/entities/turno.entity';
import { MailService } from './nodemailer.service';

@Module({
  imports: [TypeOrmModule.forFeature([Turnos])],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
