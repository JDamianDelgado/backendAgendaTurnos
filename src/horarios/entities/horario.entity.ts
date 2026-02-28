import { Profesional } from 'src/profesional/entities/profesional.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Horarios')
export class Horarios {
  @PrimaryGeneratedColumn('uuid')
  idHorario: string;

  @Column()
  dia: string;

  @Column({ type: 'time' })
  horaInicio: string;

  @Column({ type: 'time' })
  horaFin: string;

  @Column({ default: 60 })
  duracionTurno: number;

  @Column({ default: false })
  activo: boolean;

  @ManyToOne(() => Profesional, (prof) => prof.Horario, {
    onDelete: 'CASCADE',
  })
  profesional: Profesional;
}
