import { Conversacion } from 'src/conversacion/entities/conversacion.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Mensaje {
  @PrimaryGeneratedColumn('uuid')
  idMensaje: string;

  @Column('text')
  contenido: string;

  @Column({
    type: 'enum',
    enum: ['PACIENTE', 'PROFESIONAL'],
  })
  emisor: 'PACIENTE' | 'PROFESIONAL';

  @Column({ default: false })
  leido: boolean;

  @ManyToOne(() => Conversacion, (c) => c.mensajes)
  conversacion: Conversacion;

  @CreateDateColumn()
  createdAt: Date;
}
