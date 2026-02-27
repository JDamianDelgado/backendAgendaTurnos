import { estadoTurno, Turnos } from './entities/turno.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Profesional } from 'src/profesional/entities/profesional.entity';
import { CreateTurnoDto } from './dto/create-turno.dto';
import { User } from 'src/users/entities/user.entity';
import { MailService } from 'src/nodemailer/nodemailer.service';
import { generarEventoCalendario } from 'src/nodemailer/configCalendar';

@Injectable()
export class TurnosService {
  constructor(
    @InjectRepository(Turnos)
    private readonly turnosRepository: Repository<Turnos>,
    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly emailService: MailService,
  ) {}

  //normalizador de hora
  private normalizarHora(hora: string): string {
    return hora.slice(0, 5);
  }

  private obtenerDiaTexto(fecha: string): string {
    const dias = [
      'DOMINGO',
      'LUNES',
      'MARTES',
      'MIERCOLES',
      'JUEVES',
      'VIERNES',
      'SABADO',
    ];

    const date = new Date(fecha + 'T00:00:00');
    return dias[date.getDay()];
  }

  // Creación de slots según hora inicio, fin y duración
  private generarSlots(
    inicio: string,
    fin: string,
    duracion: number,
  ): string[] {
    const slots: string[] = [];
    let actual = inicio;

    while (actual < fin) {
      slots.push(actual.length === 5 ? `${actual}:00` : actual);
      actual = this.sumarMinutos(actual, duracion);
    }

    return slots;
  }

  private sumarMinutos(hora: string, minutos: number): string {
    const [h, m] = hora.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m + minutos);
    return date.toTimeString().slice(0, 5);
  }

  // Búsqueda de turnos disponibles según día y horarios del profesional
  async TurnosDisponibles(idProfesional: string, fecha: string) {
    const profesional = await this.profesionalRepository.findOne({
      where: { idProfesional },
      relations: ['Horario'],
    });

    if (!profesional || !profesional.Horario.length) {
      throw new BadRequestException('El profesional no tiene horarios');
    }

    const diaActual = this.obtenerDiaTexto(fecha);

    // Filtramos solo los horarios activos de ese día
    const horariosDelDia = profesional.Horario.filter(
      (h) => h.dia === diaActual && h.activo,
    );

    if (!horariosDelDia.length) {
      return [];
    }

    const turnos = await this.turnosRepository.find({
      where: {
        profesional: { idProfesional },
        fecha,
        estado: estadoTurno.RESERVADO,
      },
    });

    const horasOcupadas = new Set(
      turnos.map((t) => this.normalizarHora(t.hora)),
    );

    const slots = new Set<string>();

    for (const h of horariosDelDia) {
      const generados = this.generarSlots(
        h.horaInicio,
        h.horaFin,
        h.duracionTurno,
      );

      generados
        .map((hora) => this.normalizarHora(hora))
        .filter((hora) => !horasOcupadas.has(hora))
        .forEach((hora) => slots.add(hora));
    }

    return Array.from(slots).sort();
  }

  //creacion deturno
  async create(idUser: string, data: CreateTurnoDto) {
    const { profesionalId, fecha, hora } = data;

    const profesional = await this.profesionalRepository.findOne({
      where: { idProfesional: profesionalId },
      relations: ['Horario'],
    });

    if (!profesional || !profesional.Horario.length) {
      throw new BadRequestException(
        'El profesional no tiene horarios configurados',
      );
    }

    const existeTurno = await this.turnosRepository.findOne({
      where: {
        profesional: { idProfesional: profesionalId },
        fecha,
        hora,
        estado: estadoTurno.RESERVADO,
      },
    });

    if (existeTurno) {
      throw new BadRequestException('Turno no disponible');
    }

    const user = await this.userRepository.findOne({
      where: { idUser },
    });

    if (!user) {
      throw new BadRequestException('Usuario inválido');
    }

    const turno = this.turnosRepository.create({
      user,
      profesional,
      fecha,
      hora,
      estado: estadoTurno.RESERVADO,
    });

    const saveTurno = await this.turnosRepository.save(turno);
    if (saveTurno) {
      const calendar = generarEventoCalendario({
        fecha: saveTurno.fecha,
        hora: saveTurno.hora,
      });
      if (!calendar) {
        throw new BadRequestException(
          'no se pudo concretar el envio de mail para confirmacion',
        );
      }
      await this.emailService.enviarConfirmacionTurno(
        turno.user.email,
        calendar,
      );
      return saveTurno;
    }
  }

  async misTurnosProfesional(idUser: string) {
    const user = await this.userRepository.findOne({
      where: { idUser },
      relations: ['TurnosProfesional'],
    });

    if (!user) {
      throw new NotFoundException('No se encontro usuario');
    }

    return user.turnos.map((turno) => ({
      idTurno: turno.idTurno,
      fecha: turno.fecha,
      hora: turno.hora,
      estado: turno.estado,
      creado: turno.creado,
      user: {
        nombre: turno.user.nombre,
        apellido: turno.user.apellido,
        email: turno.user.email,
      },
      profesional: {
        idProfesional: turno.profesional.idProfesional,
        imagenUrl: turno.profesional.imagenUrl,
        UserProfesional: {
          nombre: turno.profesional.UserProfesional.nombre,
          apellido: turno.profesional.UserProfesional.apellido,
        },
      },
    }));
  }

  async misTurnosPaciente(idUser: string) {
    const user = await this.userRepository.findOne({
      where: { idUser },
      relations: [
        'turnos',
        'turnos.profesional',
        'turnos.profesional.UserProfesional',
      ],
    });

    if (!user) {
      throw new NotFoundException('No se encontro usuario');
    }

    return user.turnos.map((turno) => ({
      idTurno: turno.idTurno,
      fecha: turno.fecha,
      hora: turno.hora,
      estado: turno.estado,
      creado: turno.creado,
      profesional: {
        imagenUrl: turno.profesional.imagenUrl,
        UserProfesional: {
          nombre: turno.profesional.UserProfesional.nombre,
          apellido: turno.profesional.UserProfesional.apellido,
        },
      },
    }));
  }

  async cancelarTurnoPaciente(idUser: string, idTurno: string) {
    const turno = await this.turnosRepository.findOne({
      where: { idTurno },
      relations: ['user', 'profesional', 'profesional.UserProfesional'],
    });

    if (!turno) {
      throw new BadRequestException('El turno no existe');
    }

    if (turno.user.idUser !== idUser) {
      throw new BadRequestException(
        'No está autorizado para cancelar el turno',
      );
    }

    if (turno.estado !== estadoTurno.RESERVADO) {
      throw new BadRequestException(
        'Solo se pueden cancelar turnos reservados',
      );
    }

    turno.estado = estadoTurno.CANCELADO;
    await this.turnosRepository.save(turno);

    await this.emailService.enviarCancelacionTurno({
      emailPaciente: turno.user.email,
      emailProfesional: turno.profesional.UserProfesional.email,
      fecha: turno.fecha,
      hora: turno.hora,
      cancela: 'PACIENTE',
    });

    return turno;
  }

  async cancelarTurnoPorProfesional(idUser: string, idTurno: string) {
    const turno = await this.turnosRepository.findOne({
      where: { idTurno },
      relations: ['user', 'profesional', 'profesional.UserProfesional'],
    });

    if (!turno) {
      throw new BadRequestException('El turno no existe');
    }

    if (turno.profesional.UserProfesional.idUser !== idUser) {
      throw new BadRequestException(
        'No está autorizado para cancelar este turno',
      );
    }

    if (turno.estado !== estadoTurno.RESERVADO) {
      throw new BadRequestException(
        'Solo se pueden cancelar turnos reservados',
      );
    }

    turno.estado = estadoTurno.CANCELADO;
    await this.turnosRepository.save(turno);

    await this.emailService.enviarCancelacionTurno({
      emailPaciente: turno.user.email,
      emailProfesional: turno.profesional.UserProfesional.email,
      fecha: turno.fecha,
      hora: turno.hora,
      cancela: 'PROFESIONAL',
    });

    return turno;
  }

  async deleteTurno(idTurno: string) {
    const result = await this.turnosRepository.delete(idTurno);

    if (result.affected === 0) {
      throw new NotFoundException('No se encontró el turno');
    }

    return {
      message: 'Turno eliminado correctamente',
      idTurno,
    };
  }
}
