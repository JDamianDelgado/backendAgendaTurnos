import { Exclude } from 'class-transformer';
import { userRole } from 'src/auth/entities/auth.entity';
import { Profesional } from 'src/profesional/entities/profesional.entity';
import { Turnos } from 'src/turnos/entities/turno.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  idUser: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Turnos, (turno) => turno.user)
  turnos: Turnos[];

  @OneToOne(() => Profesional, (prof) => prof.UserProfesional)
  profesional?: Profesional;

  @Column({
    type: 'enum',
    enum: userRole,
    default: userRole.PACIENTE,
  })
  role: userRole;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;
}
