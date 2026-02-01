import { Profesional } from 'src/profesional/entities/profesional.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  @Column({
    type: 'enum',
    enum: estadoTurno,
    default: estadoTurno.RESERVADO,
  })
  estado: estadoTurno;

  @CreateDateColumn()
  creado: Date;
}
