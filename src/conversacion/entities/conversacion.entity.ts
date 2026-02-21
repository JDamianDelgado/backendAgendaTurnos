import { Mensaje } from 'src/mensajes/entities/mensaje.entity';
import { Turnos } from 'src/turnos/entities/turno.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Conversacion {
  @PrimaryGeneratedColumn('uuid')
  idConversacion: string;

  @OneToOne(() => Turnos)
  @JoinColumn()
  turno: Turnos;

  @ManyToOne(() => User)
  paciente: User;

  @ManyToOne(() => User)
  profesional: User;

  @OneToMany(() => Mensaje, (mensaje) => mensaje.conversacion)
  mensajes: Mensaje[];

  @Column({ default: false })
  cerrada: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
