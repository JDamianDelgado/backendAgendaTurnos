import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { authResponse } from './interface/authInterface';
import { userRole } from './entities/auth.entity';
import { MailService } from 'src/nodemailer/nodemailer.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  createToken(user: User): string {
    return this.jwtService.sign({
      sub: user.idUser,
      role: user.role,
    });
  }

  async registroUser(createAuthDto: CreateAuthDto): Promise<authResponse> {
    const findEmail = await this.userRepository.findOne({
      where: { email: createAuthDto.email },
    });
    if (findEmail) {
      throw new BadRequestException('Usuario ya registrado');
    }
    const hashPassword = await bcrypt.hash(createAuthDto.password, 10);
    const emailLowerCase = createAuthDto.email.toLowerCase();
    const user = this.userRepository.create({
      ...createAuthDto,
      email: emailLowerCase,
      password: hashPassword,
      role: createAuthDto.role ? (createAuthDto.role as userRole) : undefined,
    });
    await this.userRepository.save(user);
    const token = this.createToken(user);
    await this.mailService.enviarBienvenida(user.email, user.nombre);
    return {
      sub: user.idUser,
      token: token,
    };
  }

  async LoginUser(data: UpdateAuthDto): Promise<authResponse> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    const verificacionPass = await bcrypt.compare(data.password, user.password);
    if (!verificacionPass) {
      throw new UnauthorizedException('Credenciales invalidas');
    }
    const token = this.createToken(user);
    return {
      sub: user.idUser,
      token: token,
    };
  }

  async forgotPassword(email: string) {
    const emailNormalizado = email.toLowerCase();

    const user = await this.userRepository.findOne({
      where: { email: emailNormalizado },
    });

    if (!user) {
      return {
        message:
          'Si el email existe, enviaremos instrucciones para restablecer la contrasena.',
      };
    }

    const tokenPlano = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(tokenPlano).digest('hex');
    const expiracion = new Date(Date.now() + 15 * 60 * 1000);

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpiresAt = expiracion;
    await this.userRepository.save(user);

    await this.mailService.enviarRecuperacionPassword({
      email: user.email,
      nombre: user.nombre,
      token: tokenPlano,
      expiracionMinutos: 15,
    });

    return {
      message:
        'Si el email existe, enviaremos instrucciones para restablecer la contrasena.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: tokenHash },
    });

    if (!user || !user.resetPasswordExpiresAt) {
      throw new UnauthorizedException('Token invalido o expirado');
    }

    if (user.resetPasswordExpiresAt.getTime() < Date.now()) {
      user.resetPasswordToken = null;
      user.resetPasswordExpiresAt = null;
      await this.userRepository.save(user);
      throw new UnauthorizedException('Token invalido o expirado');
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;

    await this.userRepository.save(user);

    return { message: 'Contrasena restablecida correctamente' };
  }
}
