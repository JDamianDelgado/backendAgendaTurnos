import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { userRole } from 'src/auth/entities/auth.entity';
import { estadoTurno, Turnos } from 'src/turnos/entities/turno.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Conversacion } from './entities/conversacion.entity';

@Injectable()
export class ConversacionService {
  constructor(
    @InjectRepository(Conversacion)
    private readonly conversacionRepository: Repository<Conversacion>,
    @InjectRepository(Turnos)
    private readonly turnoRepository: Repository<Turnos>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  private esParticipante(conversacion: Conversacion, idUser: string): boolean {
    return (
      conversacion.paciente.idUser === idUser ||
      conversacion.profesional.idUser === idUser
    );
  }

  private rolEnConversacion(
    conversacion: Conversacion,
    idUser: string,
  ): userRole.PACIENTE | userRole.PROFESIONAL {
    if (conversacion.paciente.idUser === idUser) {
      return userRole.PACIENTE;
    }

    if (conversacion.profesional.idUser === idUser) {
      return userRole.PROFESIONAL;
    }

    throw new ForbiddenException('No tienes acceso a esta conversacion');
  }

  async newChat(idTurno: string, idUser: string) {
    const turno = await this.turnoRepository.findOne({
      where: { idTurno },
      relations: ['user', 'profesional', 'profesional.UserProfesional'],
    });

    if (!turno) {
      throw new NotFoundException('Turno no encontrado');
    }

    const puedeAcceder =
      turno.user.idUser === idUser ||
      turno.profesional.UserProfesional.idUser === idUser;

    if (!puedeAcceder) {
      throw new ForbiddenException('No puedes crear un chat para este turno');
    }

    if (
      turno.estado === estadoTurno.CANCELADO ||
      turno.estado === estadoTurno.COMPLETADO
    ) {
      throw new BadRequestException(
        'El turno ya finalizo, no se puede iniciar conversacion',
      );
    }

    const conversacionExistente = await this.conversacionRepository.findOne({
      where: { turno: { idTurno } },
      relations: ['turno', 'paciente', 'profesional'],
    });

    if (conversacionExistente) {
      return conversacionExistente;
    }

    const newChat = this.conversacionRepository.create({
      turno,
      paciente: turno.user,
      profesional: turno.profesional.UserProfesional,
      cerrada: false,
    });

    return this.conversacionRepository.save(newChat);
  }

  async misConversaciones(idUser: string) {
    const user = await this.userRepository.findOne({ where: { idUser } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const conversaciones = await this.conversacionRepository.find({
      where: [{ paciente: { idUser } }, { profesional: { idUser } }],
      relations: ['turno', 'paciente', 'profesional', 'mensajes'],
      order: { updatedAt: 'DESC' },
    });

    return conversaciones.map((conversacion) => {
      const rolActual = this.rolEnConversacion(conversacion, idUser);
      const esPaciente = rolActual === userRole.PACIENTE;
      const contraparte = esPaciente
        ? conversacion.profesional
        : conversacion.paciente;
      const emisorContrario = esPaciente ? 'PROFESIONAL' : 'PACIENTE';

      const mensajesOrdenados = [...conversacion.mensajes].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
      );
      const ultimoMensaje =
        mensajesOrdenados.length > 0
          ? mensajesOrdenados[mensajesOrdenados.length - 1]
          : null;

      const noLeidos = conversacion.mensajes.filter(
        (mensaje) => !mensaje.leido && mensaje.emisor === emisorContrario,
      ).length;

      return {
        idConversacion: conversacion.idConversacion,
        cerrada: conversacion.cerrada,
        turno: {
          idTurno: conversacion.turno.idTurno,
          fecha: conversacion.turno.fecha,
          hora: conversacion.turno.hora,
          estado: conversacion.turno.estado,
        },
        contraparte: {
          idUser: contraparte.idUser,
          nombre: contraparte.nombre,
          apellido: contraparte.apellido,
          email: contraparte.email,
        },
        ultimoMensaje: ultimoMensaje
          ? {
              idMensaje: ultimoMensaje.idMensaje,
              contenido: ultimoMensaje.contenido,
              emisor: ultimoMensaje.emisor,
              leido: ultimoMensaje.leido,
              createdAt: ultimoMensaje.createdAt,
            }
          : null,
        noLeidos,
        updatedAt: conversacion.updatedAt,
      };
    });
  }

  async mensajesPorConversacion(idConversacion: string, idUser: string) {
    const conversacion = await this.conversacionRepository.findOne({
      where: { idConversacion },
      relations: ['turno', 'paciente', 'profesional', 'mensajes'],
      order: { mensajes: { createdAt: 'ASC' } },
    });

    if (!conversacion) {
      throw new NotFoundException('Conversacion no encontrada');
    }

    if (!this.esParticipante(conversacion, idUser)) {
      throw new ForbiddenException('No tienes acceso a esta conversacion');
    }

    return {
      idConversacion: conversacion.idConversacion,
      cerrada: conversacion.cerrada,
      turno: {
        idTurno: conversacion.turno.idTurno,
        fecha: conversacion.turno.fecha,
        hora: conversacion.turno.hora,
        estado: conversacion.turno.estado,
      },
      mensajes: conversacion.mensajes.map((mensaje) => ({
        idMensaje: mensaje.idMensaje,
        contenido: mensaje.contenido,
        emisor: mensaje.emisor,
        leido: mensaje.leido,
        createdAt: mensaje.createdAt,
      })),
    };
  }
}
