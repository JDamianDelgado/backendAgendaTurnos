import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class CreateAuthDto {
  @IsNotEmpty({ message: 'Nombre es obligatorio' })
  nombre: string;

  @IsNotEmpty({ message: 'Apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @MinLength(6, { message: 'La contraseña debe tener mínimo 6 caracteres' })
  password: string;

  @IsOptional()
  role?: string;
}
