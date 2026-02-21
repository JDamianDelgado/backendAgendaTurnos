import { Module } from '@nestjs/common';
// import { ConversacionService } from './conversacion.service';
import { ConversacionController } from './conversacion.controller';

@Module({
  controllers: [ConversacionController],
  // providers: [ConversacionService],
})
export class ConversacionModule {}
