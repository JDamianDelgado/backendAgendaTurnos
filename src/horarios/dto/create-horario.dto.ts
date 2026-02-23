import { IsBoolean, IsString, IsNumber, IsEnum } from 'class-validator';
import { DiasSemana } from './dias-horarios.dto';

export class CreateHorarioDto {
  @IsEnum(DiasSemana, {
    message: 'El día debe ser un día válido de la semana en mayusculas',
  })
  dia: DiasSemana;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFin: string;

  @IsNumber()
  duracionTurno: number;

  @IsBoolean()
  activo: boolean;
}
