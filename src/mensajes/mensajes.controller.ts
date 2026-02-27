import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { userRole } from 'src/auth/entities/auth.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { MensajesService } from './mensajes.service';

@Controller('chat/:idConversacion/mensajes')
@UseGuards(JwtAuthGuard)
export class MensajesController {
  constructor(private readonly mensajesService: MensajesService) {}

  @Post()
  enviarMensaje(
    @Param('idConversacion') idConversacion: string,
    @CurrentUser() user: { sub: string; role: userRole },
    @Body() createMensajeDto: CreateMensajeDto,
  ) {
    return this.mensajesService.enviarMensaje(
      idConversacion,
      user.sub,
      createMensajeDto.contenido,
    );
  }

  @Patch('leidos')
  marcarLeidos(
    @Param('idConversacion') idConversacion: string,
    @CurrentUser() user: { sub: string; role: userRole },
  ) {
    return this.mensajesService.marcarLeidos(idConversacion, user.sub);
  }
}
