import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversacion } from 'src/conversacion/entities/conversacion.entity';
import { MensajesService } from './mensajes.service';
import { MensajesController } from './mensajes.controller';
import { Mensaje } from './entities/mensaje.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mensaje, Conversacion])],
  controllers: [MensajesController],
  providers: [MensajesService],
})
export class MensajesModule {}
