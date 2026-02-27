import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { estadoTurno } from 'src/turnos/entities/turno.entity';
import { Repository } from 'typeorm';
import { Conversacion } from 'src/conversacion/entities/conversacion.entity';
import { Mensaje } from './entities/mensaje.entity';

@Injectable()
export class MensajesService {
  constructor(
    @InjectRepository(Mensaje)
    private readonly mensajesRepository: Repository<Mensaje>,
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
  ) {}

  private resolverEmisor(conversacion: Conversacion, idUser: string) {
    if (conversacion.paciente.idUser === idUser) {
      return 'PACIENTE' as const;
    }

    if (conversacion.profesional.idUser === idUser) {
      return 'PROFESIONAL' as const;
    }

    throw new ForbiddenException('No tienes permiso para enviar mensajes aqui');
  }

  async enviarMensaje(
    idConversacion: string,
    idUser: string,
    contenido: string,
  ) {
    const conversacion = await this.conversacionRepository.findOne({
      where: { idConversacion },
      relations: ['paciente', 'profesional', 'turno'],
    });

    if (!conversacion) {
      throw new NotFoundException('Conversacion no encontrada');
    }

    const emisor = this.resolverEmisor(conversacion, idUser);

    if (
      conversacion.cerrada ||
      conversacion.turno.estado !== estadoTurno.RESERVADO
    ) {
      throw new BadRequestException('La conversacion esta cerrada');
    }

    const mensaje = this.mensajesRepository.create({
      contenido,
      emisor,
      leido: false,
      conversacion,
    });

    return this.mensajesRepository.save(mensaje);
  }

  async marcarLeidos(idConversacion: string, idUser: string) {
    const conversacion = await this.conversacionRepository.findOne({
      where: { idConversacion },
      relations: ['paciente', 'profesional'],
    });

    if (!conversacion) {
      throw new NotFoundException('Conversacion no encontrada');
    }

    const emisorActual = this.resolverEmisor(conversacion, idUser);
    const emisorContrario =
      emisorActual === 'PACIENTE' ? 'PROFESIONAL' : 'PACIENTE';

    const mensajesNoLeidos = await this.mensajesRepository.find({
      where: {
        conversacion: { idConversacion },
        emisor: emisorContrario,
        leido: false,
      },
      relations: ['conversacion'],
    });

    if (mensajesNoLeidos.length > 0) {
      mensajesNoLeidos.forEach((mensaje) => {
        mensaje.leido = true;
      });
      await this.mensajesRepository.save(mensajesNoLeidos);
    }

    return { message: 'Mensajes marcados como leidos' };
  }
}
