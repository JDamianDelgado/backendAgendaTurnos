import { IsBoolean, IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateProfesionalDto {
  @IsOptional()
  @IsUrl()
  imagenUrl?: string;

  @IsOptional()
  @IsString()
  especialidad?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
