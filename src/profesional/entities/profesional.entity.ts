import { Horarios } from 'src/horarios/entities/horario.entity';
import { Turnos } from 'src/turnos/entities/turno.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Profesional')
export class Profesional {
  @PrimaryGeneratedColumn('uuid')
  idProfesional: string;

  @OneToOne(() => User, (user) => user.profesional, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'idUser' })
  UserProfesional: User;

  @Column()
  imagenUrl: string;

  @Column()
  especialidad: string;

  @Column()
  descripcion: string;

  @Column()
  activo: boolean;

  @OneToMany(() => Turnos, (turno) => turno.profesional)
  TurnosProfesional: Turnos[];

  @OneToMany(() => Horarios, (horario) => horario.profesional, {
    cascade: true,
  })
  Horario: Horarios[];
}
