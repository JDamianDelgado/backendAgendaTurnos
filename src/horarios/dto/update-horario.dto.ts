import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { DiasSemana } from './dias-horarios.dto';

export class UpdateHorarioDto {
  @IsOptional()
  @IsEnum(DiasSemana, {
    message: 'El día debe ser un día válido de la semana en mayusculas',
  })
  dia: DiasSemana;

  @IsOptional()
  @IsString()
  horaInicio?: string;

  @IsOptional()
  @IsString()
  horaFin?: string;

  @IsOptional()
  @IsNumber()
  duracionTurno?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
