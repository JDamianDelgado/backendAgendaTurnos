import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  async enviarConfirmacionTurno(email: string, eventoICS: string) {
    await this.transporter.sendMail({
      to: email,
      subject: 'Confirmación de turno',
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
        ? 'El profesional canceló tu turno.'
        : 'Cancelaste tu turno correctamente.';

    const mensajeProfesional =
      cancela === 'PACIENTE'
        ? 'El paciente canceló el turno.'
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

  async enviarBienvenida(email: string, nombre: string) {
    await this.transporter.sendMail({
      to: email,
      subject: '¡Bienvenido/a a PowerOfMind! 👋',
      text: `Hola ${nombre},

¡Gracias por registrarte en PowerOfMind!

Desde ahora podés:
• Reservar turnos fácilmente
• Cancelarlos o reprogramarlos
• Recibir confirmaciones por email

Si tenés alguna duda, estamos para ayudarte.

¡Bienvenido/a!
Equipo PowerOfMind`,
    });
  }
}
