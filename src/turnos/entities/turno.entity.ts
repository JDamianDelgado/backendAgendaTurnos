// import { Conversacion } from 'src/conversacion/entities/conversacion.entity';
import { Profesional } from 'src/profesional/entities/profesional.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  // OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum estadoTurno {
  RESERVADO = 'RESERVADO',
  CANCELADO = 'CANCELADO',
  COMPLETADO = 'COMPLETADO',
}

@Entity('Turnos')
export class Turnos {
  @PrimaryGeneratedColumn('uuid')
  idTurno: string;

  @ManyToOne(() => User, (user) => user.turnos)
  user: User;

  @ManyToOne(() => Profesional, (prof) => prof.TurnosProfesional)
  profesional: Profesional;

  @Column({ type: 'date' })
  fecha: string;

  @Column({ type: 'time' })
  hora: string;

  // @OneToOne(() => Conversacion, (c) => c.turno)
  // conversacion: Conversacion;

  @Column({
    type: 'enum',
    enum: estadoTurno,
    default: estadoTurno.RESERVADO,
  })
  estado: estadoTurno;

  @CreateDateColumn()
  creado: Date;
}
