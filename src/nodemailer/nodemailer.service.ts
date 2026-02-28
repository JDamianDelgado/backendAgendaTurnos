import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { estadoTurno, Turnos } from 'src/turnos/entities/turno.entity';
import { Repository } from 'typeorm';
import { existsSync } from 'fs';

@Injectable()
export class MailService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MailService.name);
  private readonly reminderHours = Number(
    process.env.REMINDER_HOURS_BEFORE ?? 3,
  );
  private readonly frontendUrl =
    process.env.FRONTEND_URL || process.env.FRONTEND_LOCAL2 || '';
  private readonly emailFrom =
    process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@localhost';
  private readonly appName = process.env.APP_NAME || 'PowerOfMind';
  private readonly supportEmail = process.env.SUPPORT_EMAIL || this.emailFrom;
  private readonly logoUrl = process.env.EMAIL_LOGO_URL || '';
  private readonly logoPath = process.env.EMAIL_LOGO_PATH || '';
  private readonly logoCid = 'brand-logo';
  private readonly brandPrimary = process.env.EMAIL_BRAND_PRIMARY || '#0f766e';
  private readonly brandSecondary =
    process.env.EMAIL_BRAND_SECONDARY || '#1d4ed8';
  private readonly brandBackground =
    process.env.EMAIL_BRAND_BACKGROUND || '#f3f7fb';
  private readonly brandText = process.env.EMAIL_BRAND_TEXT || '#1e293b';
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
    void this.verificarConexionSMTP();

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

  private async verificarConexionSMTP() {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP conectado correctamente');
    } catch (error) {
      this.logger.error('No se pudo verificar SMTP', error);
    }
  }

  private normalizarHora(hora: string): string {
    return hora.length >= 5 ? hora.slice(0, 5) : hora;
  }

  private formatearFecha(fecha: string): string {
    const date = new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(date.getTime())) {
      return fecha;
    }

    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private escaparHtml(valor: string): string {
    return valor
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private construirLogoHtml(
    src: string,
    alt: string,
    maxHeight: number,
  ): string {
    return `<img src="${src}" alt="${this.escaparHtml(alt)}" style="max-height:${maxHeight}px; width:auto; display:block;" />`;
  }

  private obtenerLogoConfig() {
    if (this.logoPath && existsSync(this.logoPath)) {
      return {
        logoHeaderHtml: this.construirLogoHtml(
          `cid:${this.logoCid}`,
          this.appName,
          56,
        ),
        logoFooterHtml: this.construirLogoHtml(
          `cid:${this.logoCid}`,
          this.appName,
          34,
        ),
        logoAttachments: [
          {
            filename: 'logo-navbar.png',
            path: this.logoPath,
            cid: this.logoCid,
          },
        ],
      };
    }

    if (this.logoUrl) {
      return {
        logoHeaderHtml: this.construirLogoHtml(this.logoUrl, this.appName, 56),
        logoFooterHtml: this.construirLogoHtml(this.logoUrl, this.appName, 34),
        logoAttachments: [] as Array<{
          filename: string;
          path: string;
          cid: string;
        }>,
      };
    }

    return {
      logoHeaderHtml: `<div style="font-size:22px;font-weight:700;color:${this.brandText};">${this.escaparHtml(this.appName)}</div>`,
      logoFooterHtml: `<div style="font-size:16px;font-weight:700;color:${this.brandText};">${this.escaparHtml(this.appName)}</div>`,
      logoAttachments: [] as Array<{
        filename: string;
        path: string;
        cid: string;
      }>,
    };
  }

  private crearTemplateEmail({
    titulo,
    saludo,
    mensajeHtml,
    ctaTexto,
    ctaUrl,
    notaFinal,
    preheader,
  }: {
    titulo: string;
    saludo?: string;
    mensajeHtml: string;
    ctaTexto?: string;
    ctaUrl?: string;
    notaFinal?: string;
    preheader?: string;
  }) {
    const { logoHeaderHtml, logoFooterHtml, logoAttachments } =
      this.obtenerLogoConfig();
    const footerMessage =
      notaFinal ||
      'Si tienes alguna consulta, responde este correo y te ayudaremos.';

    const cta =
      ctaTexto && ctaUrl
        ? `<div style="margin-top:24px;"><a href="${ctaUrl}" style="display:inline-block;background:${this.brandPrimary};color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:700;">${this.escaparHtml(ctaTexto)}</a></div>`
        : '';

    const html = `
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${this.escaparHtml(preheader || titulo)}</div>
      <div style="margin:0;padding:24px 0;background:${this.brandBackground};">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #dfe7f2;border-radius:16px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:${this.brandText};box-shadow:0 10px 30px rgba(15,23,42,.08);">
          <tr>
            <td style="padding:24px 24px 12px;background:linear-gradient(135deg,${this.brandSecondary}1A 0%,${this.brandPrimary}1A 100%);">
              ${logoHeaderHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 0;">
              <div style="display:inline-block;padding:6px 10px;border-radius:999px;background:${this.brandPrimary}1A;color:${this.brandPrimary};font-size:12px;font-weight:700;letter-spacing:.3px;margin-bottom:10px;">NOTIFICACION ${this.escaparHtml(this.appName.toUpperCase())}</div>
              <h1 style="margin:0;font-size:24px;line-height:1.3;color:${this.brandText};">${this.escaparHtml(titulo)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px 0;font-size:15px;line-height:1.6;color:${this.brandText};">
              ${saludo ? `<p style="margin:0 0 14px;">${this.escaparHtml(saludo)}</p>` : ''}
              <div style="margin-top:8px;padding:16px;border:1px solid #e5edf8;border-radius:12px;background:linear-gradient(180deg,#ffffff 0%,#f9fbff 100%);">
                ${mensajeHtml}
              </div>
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px 24px;">
              <div style="border-top:1px solid #e8edf5;padding-top:14px;font-size:13px;line-height:1.5;color:#64748b;">
                ${this.escaparHtml(footerMessage)}<br />
                ${this.escaparHtml(this.appName)} | ${this.escaparHtml(this.supportEmail)}
              </div>
              <div style="margin-top:14px;display:flex;justify-content:flex-end;">
                ${logoFooterHtml}
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    return { html, logoAttachments };
  }

  private crearResumenTurnoHtml(fecha: string, hora: string, estado: string) {
    return `
      <div style="margin-top:8px;margin-bottom:6px;">${this.escaparHtml(estado)}</div>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:12px;border-collapse:separate;border-spacing:0;background:#f8fafc;border:1px solid #dbe4f0;border-radius:10px;overflow:hidden;min-width:280px;">
        <tr>
          <td style="padding:10px 14px;font-size:13px;color:#64748b;border-bottom:1px solid #e2e8f0;">Fecha</td>
          <td style="padding:10px 14px;font-size:14px;color:#1e293b;font-weight:600;border-bottom:1px solid #e2e8f0;">${this.escaparHtml(this.formatearFecha(fecha))}</td>
        </tr>
        <tr>
          <td style="padding:10px 14px;font-size:13px;color:#64748b;">Hora</td>
          <td style="padding:10px 14px;font-size:14px;color:#1e293b;font-weight:600;">${this.escaparHtml(this.normalizarHora(hora))}</td>
        </tr>
      </table>
    `;
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
      const inicioVentana = new Date(
        ahora.getTime() + this.reminderHours * 60 * 60 * 1000,
      );
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
    const { html, logoAttachments } = this.crearTemplateEmail({
      titulo: 'Confirmacion de turno',
      mensajeHtml:
        '<p style="margin:0;">Tu turno fue confirmado con exito.</p><p style="margin:12px 0 0;">Te enviamos el archivo .ics para que lo agregues al calendario en segundos.</p>',

      preheader: 'Tu turno ya esta confirmado.',
    });

    await this.transporter.sendMail({
      from: this.emailFrom,
      to: email,
      subject: 'Confirmacion de turno',
      text: `Tu turno fue confirmado.\nAdjuntamos el archivo .ics para agregarlo al calendario.\n\nEquipo ${this.appName}`,
      attachments: [
        ...logoAttachments,
        {
          filename: 'turno.ics',
          content: eventoICS,
          contentType: 'text/calendar',
        },
      ],
      html,
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

    const htmlPaciente = this.crearTemplateEmail({
      titulo: 'Turno cancelado',
      mensajeHtml: `
        <p style="margin:0;">${this.escaparHtml(mensajePaciente)}</p>
        ${this.crearResumenTurnoHtml(fecha, hora, 'Detalle de la cancelacion')}
      `,

      preheader: 'Se registro una cancelacion en tu agenda.',
    });

    const htmlProfesional = this.crearTemplateEmail({
      titulo: 'Turno cancelado',
      mensajeHtml: `
        <p style="margin:0;">${this.escaparHtml(mensajeProfesional)}</p>
        ${this.crearResumenTurnoHtml(fecha, hora, 'Detalle de la cancelacion')}
      `,

      preheader: 'Se actualizo el estado de un turno.',
    });

    await this.transporter.sendMail({
      from: this.emailFrom,
      to: emailPaciente,
      subject: 'Turno cancelado',
      text: `${mensajePaciente}\n\nFecha: ${this.formatearFecha(fecha)}\nHora: ${this.normalizarHora(hora)}\n\nEquipo ${this.appName}`,
      html: htmlPaciente.html,
      attachments: htmlPaciente.logoAttachments,
    });

    await this.transporter.sendMail({
      from: this.emailFrom,
      to: emailProfesional,
      subject: 'Turno cancelado',
      text: `${mensajeProfesional}\n\nFecha: ${this.formatearFecha(fecha)}\nHora: ${this.normalizarHora(hora)}\n\nEquipo ${this.appName}`,
      html: htmlProfesional.html,
      attachments: htmlProfesional.logoAttachments,
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
    const texto = `Recordatorio: tienes un turno proximo.\n\nFecha: ${this.formatearFecha(fecha)}\nHora: ${this.normalizarHora(hora)}\n\nEquipo ${this.appName}`;
    const htmlRecordatorio = this.crearTemplateEmail({
      titulo: 'Recordatorio de turno',
      mensajeHtml: `
        <p style="margin:0;">Este es un recordatorio de tu turno proximo.</p>
        ${this.crearResumenTurnoHtml(fecha, hora, 'Te esperamos en el horario indicado ingresa a la plataforma donde se te brindara instrucciones de como proseguir para la sesion.')}
      `,

      preheader: 'No olvides tu turno de hoy.',
    });

    await this.transporter.sendMail({
      from: this.emailFrom,
      to: emailPaciente,
      subject: 'Recordatorio de turno',
      text: texto,
      html: htmlRecordatorio.html,
      attachments: htmlRecordatorio.logoAttachments,
    });

    await this.transporter.sendMail({
      from: this.emailFrom,
      to: emailProfesional,
      subject: 'Recordatorio de turno',
      text: texto,
      html: htmlRecordatorio.html,
      attachments: htmlRecordatorio.logoAttachments,
    });
  }

  async enviarBienvenida(email: string, nombre: string) {
    const bienvenida = this.crearTemplateEmail({
      titulo: `Bienvenido/a a ${this.appName}`,
      saludo: `Hola ${nombre},`,
      mensajeHtml: `
        <p style="margin:0 0 12px;">Gracias por registrarte en ${this.escaparHtml(this.appName)}.</p>
        <p style="margin:0 0 8px;">Tu cuenta ya esta activa. Desde ahora puedes:</p>
        <ul style="margin:0;padding-left:18px;color:#334155;">
          <li style="margin-bottom:6px;">Reservar turnos facilmente</li>
          <li style="margin-bottom:6px;">Cancelar o reprogramar cuando lo necesites</li>
          <li>Recibir confirmaciones y recordatorios por email</li>
        </ul>
      `,
      ctaTexto: this.frontendUrl ? 'Ir a la plataforma' : undefined,
      ctaUrl: this.frontendUrl || undefined,
      preheader: `Tu cuenta en ${this.appName} ya esta lista.`,
    });

    await this.transporter.sendMail({
      from: this.emailFrom,
      to: email,
      subject: `Bienvenido/a a ${this.appName}`,
      text: `Hola ${nombre},\n\nGracias por registrarte en ${this.appName}.\n\nTu cuenta ya esta activa. Desde ahora puedes:\n- Reservar turnos facilmente\n- Cancelarlos o reprogramarlos\n- Recibir confirmaciones y recordatorios por email\n\nSi tienes alguna duda, responde este correo.\n\nEquipo ${this.appName}`,
      html: bienvenida.html,
      attachments: bienvenida.logoAttachments,
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
    const recuperacion = this.crearTemplateEmail({
      titulo: 'Recuperacion de contrasena',
      saludo: `Hola ${nombre},`,
      mensajeHtml: `
        <p style="margin:0 0 14px;">Recibimos una solicitud para restablecer tu contrasena.</p>
        <p style="margin:0 0 14px;">Por seguridad, este enlace vence en ${this.escaparHtml(expiracionMinutos.toString())} minutos.</p>
        <p style="margin:0;">Si no fuiste tu, puedes ignorar este mensaje.</p>
      `,
      ctaTexto: 'Restablecer contrasena',
      ctaUrl: resetUrl,
      notaFinal:
        'Si no solicitaste este cambio, ignora este correo. Tu cuenta seguira protegida.',
      preheader: 'Solicitud para cambiar tu contrasena.',
    });

    await this.transporter.sendMail({
      from: this.emailFrom,
      to: email,
      subject: 'Recuperacion de contrasena',
      text: `Hola ${nombre},\n\nRecibimos una solicitud para restablecer tu contrasena.\n\nUsa este enlace:\n${resetUrl}\n\nEl enlace vence en ${expiracionMinutos} minutos.\n\nSi no solicitaste este cambio, ignora este mensaje.\n\nEquipo ${this.appName}`,
      html: recuperacion.html,
      attachments: recuperacion.logoAttachments,
    });
  }
}
