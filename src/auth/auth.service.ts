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

    const user = this.userRepository.create({
      ...createAuthDto,
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
}
