import { IsNotEmpty, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty({ message: 'Token es obligatorio' })
  token: string;

  @MinLength(6, { message: 'La contrasena debe tener minimo 6 caracteres' })
  newPassword: string;
}
