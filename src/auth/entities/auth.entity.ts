import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum userRole {
  PACIENTE = 'PACIENTE',
  PROFESIONAL = 'PROFESIONAL',
  ADMIN = 'ADMIN',
}
@Entity('Auth')
export class Auth {
  @PrimaryGeneratedColumn('uuid')
  idAuth: string;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  email: string;

  @Column()
  password: string;

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
