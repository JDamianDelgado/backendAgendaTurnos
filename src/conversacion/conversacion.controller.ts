import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { userRole } from 'src/auth/entities/auth.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ConversacionService } from './conversacion.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ConversacionController {
  constructor(private readonly conversacionService: ConversacionService) {}

  @Post(':idTurno')
  async nuevoChat(
    @Param('idTurno') idTurno: string,
    @CurrentUser() user: { sub: string; role: userRole },
  ) {
    return await this.conversacionService.newChat(idTurno, user.sub);
  }

  @Get('mis-conversaciones')
  misConversaciones(@CurrentUser() user: { sub: string; role: userRole }) {
    return this.conversacionService.misConversaciones(user.sub);
  }

  @Get(':idConversacion/mensajes')
  mensajesPorConversacion(
    @Param('idConversacion') idConversacion: string,
    @CurrentUser() user: { sub: string; role: userRole },
  ) {
    return this.conversacionService.mensajesPorConversacion(
      idConversacion,
      user.sub,
    );
  }
}
