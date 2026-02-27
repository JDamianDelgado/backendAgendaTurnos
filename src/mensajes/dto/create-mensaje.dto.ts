import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMensajeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  contenido: string;
}
