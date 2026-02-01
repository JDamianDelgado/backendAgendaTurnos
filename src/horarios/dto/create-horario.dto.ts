import { IsBoolean, IsString, IsNumber } from 'class-validator';

export class CreateHorarioDto {
  @IsString()
  dia: string;

  @IsString()
  horaInicio: string;

  @IsString()
  horaFin: string;

  @IsNumber()
  duracionTurno: number;

  @IsBoolean()
  activo: boolean;
}
