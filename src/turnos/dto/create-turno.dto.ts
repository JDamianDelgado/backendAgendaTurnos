import { IsDateString, IsUUID, IsString } from 'class-validator';

export class CreateTurnoDto {
  @IsUUID()
  profesionalId: string;

  @IsDateString()
  fecha: string;

  @IsString()
  hora: string;
}
