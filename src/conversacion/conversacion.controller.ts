// import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
// import { ConversacionService } from './conversacion.service';
// import { CreateConversacionDto } from './dto/create-conversacion.dto';
// import { UpdateConversacionDto } from './dto/update-conversacion.dto';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
// import { userRole } from 'src/auth/entities/auth.entity';

import { Controller } from '@nestjs/common';

@Controller('chat')
export class ConversacionController {
  constructor() {}

  // @UseGuards(JwtAuthGuard)
  // @Post(':idTurno')
  // async nuevoChat(
  //   @Param('idTurno') idTurno: string,
  //   @CurrentUser()
  //   user: {
  //     sub: string;
  //     role: userRole;
  //   },
  // ) {
  //   return await this.conversacionService.newChat(idTurno, user.sub);
  // }
}
