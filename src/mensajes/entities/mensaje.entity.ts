import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

export enum EstadoMensaje {
  ENVIADO = 'ENVIADO',
  LEIDO = 'LEIDO',
  CANCELADO = 'CANCELADO',
}

export enum EmisorMensaje {
  PACIENTE = 'PACIENTE',
  PROFESIONAL = 'PROFESIONAL',
  SISTEMA = 'SISTEMA',
}

@Entity('mensajes')
export class Mensaje {
  @PrimaryGeneratedColumn('uuid')
  idMensaje: string;

  @Column()
  idPaciente: string;

  @Column()
  idProfesional: string;

  @Column('text')
  contenido: string;

  @Column({ type: 'enum', enum: EmisorMensaje })
  emisor: EmisorMensaje;

  @Column({ type: 'enum', enum: EstadoMensaje, default: EstadoMensaje.ENVIADO })
  estado: EstadoMensaje;

  @CreateDateColumn()
  fechaEnvio: Date;
}
