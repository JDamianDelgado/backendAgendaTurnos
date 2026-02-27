import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { estadoTurno, Turnos } from 'src/turnos/entities/turno.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private readonly reminderHours = Number(process.env.REMINDER_HOURS_BEFORE ?? 3);
  private reminderInterval: NodeJS.Timeout | null = null;
  private isProcessingReminders = false;

  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  constructor(
    @InjectRepository(Turnos)
    private readonly turnosRepository: Repository<Turnos>,
  ) {}

  onModuleInit() {
    this.reminderInterval = setInterval(() => {
      void this.procesarRecordatorios();
    }, 60_000);
  }

  onModuleDestroy() {
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
      this.reminderInterval = null;
    }
  }

  private crearFechaTurno(fecha: string, hora: string): Date {
    const horaNormalizada = hora.length === 5 ? `${hora}:00` : hora;
    return new Date(`${fecha}T${horaNormalizada}`);
  }

  private async procesarRecordatorios() {
    if (this.isProcessingReminders) {
      return;
    }

    this.isProcessingReminders = true;

    try {
      const turnos = await this.turnosRepository.find({
        where: {
          estado: estadoTurno.RESERVADO,
          recordatorioEnviado: false,
        },
        relations: ['user', 'profesional', 'profesional.UserProfesional'],
      });

      const ahora = new Date();
      const inicioVentana = new Date(ahora.getTime() + this.reminderHours * 60 * 60 * 1000);
      const finVentana = new Date(inicioVentana.getTime() + 60 * 1000);

      const turnosARecordar = turnos.filter((turno) => {
        const fechaTurno = this.crearFechaTurno(turno.fecha, turno.hora);
        return fechaTurno >= inicioVentana && fechaTurno < finVentana;
      });

      for (const turno of turnosARecordar) {
        const emailPaciente = turno.user.email;
        const emailProfesional = turno.profesional.UserProfesional.email;

        await this.enviarRecordatorioTurno({
          emailPaciente,
          emailProfesional,
          fecha: turno.fecha,
          hora: turno.hora,
        });

        turno.recordatorioEnviado = true;
        await this.turnosRepository.save(turno);
      }
    } catch (error) {
      this.logger.error('Error enviando recordatorios de turnos', error);
    } finally {
      this.isProcessingReminders = false;
    }
  }

  async enviarConfirmacionTurno(email: string, eventoICS: string) {
    await this.transporter.sendMail({
      to: email,
      subject: 'Confirmacion de turno',
      text: 'Adjuntamos tu turno para agregar al calendario',
      attachments: [
        {
          filename: 'turno.ics',
          content: eventoICS,
          contentType: 'text/calendar',
        },
      ],
    });
  }

  async enviarCancelacionTurno({
    emailPaciente,
    emailProfesional,
    fecha,
    hora,
    cancela,
  }: {
    emailPaciente: string;
    emailProfesional: string;
    fecha: string;
    hora: string;
    cancela: 'PACIENTE' | 'PROFESIONAL';
  }) {
    const mensajePaciente =
      cancela === 'PROFESIONAL'
        ? 'El profesional cancelo tu turno.'
        : 'Cancelaste tu turno correctamente.';

    const mensajeProfesional =
      cancela === 'PACIENTE'
        ? 'El paciente cancelo el turno.'
        : 'Cancelaste el turno correctamente.';

    await this.transporter.sendMail({
      to: emailPaciente,
      subject: 'Turno cancelado',
      text: `${mensajePaciente}\n\nFecha: ${fecha}\nHora: ${hora}`,
    });

    await this.transporter.sendMail({
      to: emailProfesional,
      subject: 'Turno cancelado',
      text: `${mensajeProfesional}\n\nFecha: ${fecha}\nHora: ${hora}`,
    });
  }

  async enviarRecordatorioTurno({
    emailPaciente,
    emailProfesional,
    fecha,
    hora,
  }: {
    emailPaciente: string;
    emailProfesional: string;
    fecha: string;
    hora: string;
  }) {
    const texto = `Recordatorio: tienes un turno proximamente.\n\nFecha: ${fecha}\nHora: ${hora}`;

    await this.transporter.sendMail({
      to: emailPaciente,
      subject: 'Recordatorio de turno',
      text: texto,
    });

    await this.transporter.sendMail({
      to: emailProfesional,
      subject: 'Recordatorio de turno',
      text: texto,
    });
  }

  async enviarBienvenida(email: string, nombre: string) {
    await this.transporter.sendMail({
      to: email,
      subject: 'Bienvenido/a a PowerOfMind',
      text: `Hola ${nombre},

Gracias por registrarte en PowerOfMind.

Desde ahora puedes:
- Reservar turnos facilmente
- Cancelarlos o reprogramarlos
- Recibir confirmaciones por email

Si tienes alguna duda, estamos para ayudarte.

Bienvenido/a.
Equipo PowerOfMind`,
    });
  }

  async enviarRecuperacionPassword({
    email,
    nombre,
    token,
    expiracionMinutos,
  }: {
    email: string;
    nombre: string;
    token: string;
    expiracionMinutos: number;
  }) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    await this.transporter.sendMail({
      to: email,
      subject: 'Recuperacion de contrasena',
      text: `Hola ${nombre},

Recibimos una solicitud para restablecer tu contrasena.

Usa este enlace:
${resetUrl}

El enlace vence en ${expiracionMinutos} minutos.

Si no solicitaste este cambio, ignora este mensaje.`,
    });
  }
}
