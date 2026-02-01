import { IsBoolean, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateProfesionalDto {
  @IsUrl()
  imagenUrl: string;

  @IsString()
  @IsNotEmpty()
  especialidad: string;

  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsBoolean()
  activo: boolean = true;
}
