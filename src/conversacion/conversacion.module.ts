import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversacionController } from './conversacion.controller';
import { ConversacionService } from './conversacion.service';
import { Conversacion } from './entities/conversacion.entity';
import { Turnos } from 'src/turnos/entities/turno.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Conversacion, Turnos, User])],
  controllers: [ConversacionController],
  providers: [ConversacionService],
  exports: [ConversacionService],
})
export class ConversacionModule {}
