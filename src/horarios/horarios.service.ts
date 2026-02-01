import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Horarios } from './entities/horario.entity';
import { DeepPartial, Repository } from 'typeorm';
import { Profesional } from 'src/profesional/entities/profesional.entity';
import { User } from 'src/users/entities/user.entity';
import { userRole } from 'src/auth/entities/auth.entity';

@Injectable()
export class HorariosService {
  constructor(
    @InjectRepository(Horarios)
    private readonly horarioRepository: Repository<Horarios>,
    @InjectRepository(Profesional)
    private readonly profesionalRepository: Repository<Profesional>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(id: string, role: string, data: CreateHorarioDto) {
    if (!id || !role || !data) {
      throw new BadRequestException('datos incompletos ');
    }

    const user = await this.userRepository.findOne({
      where: { idUser: id },
      relations: ['profesional'],
    });
    if (!user || user.role !== userRole.PROFESIONAL) {
      throw new BadRequestException('No se puede realizar esta accion');
    }
    if (!user.profesional?.descripcion || !user.profesional.idProfesional) {
      throw new BadRequestException('Crea tu perfil profesional');
    }
    const { dia, horaInicio, horaFin, duracionTurno, activo } = data;
    const create = this.horarioRepository.create({
      horaInicio: horaInicio,
      duracionTurno: duracionTurno,
      activo: activo || true,
      horaFin: horaFin,
      dia: dia,
      profesional: user.profesional,
    });
    const save = await this.horarioRepository.save(create);
    if (!save || !create) {
      throw new BadRequestException('No se pudo realizar accion ');
    }
    return { save };
  }

  async misHorarios(id: string) {
    const user = await this.userRepository.findOne({
      where: { idUser: id },
      relations: ['profesional'],
    });

    if (!user) {
      throw new BadRequestException('No se encontro usuario');
    }
    const misHorarios = user.profesional?.Horario;
    return {
      misHorarios,
    };
  }
  async findAll() {
    const turnos = await this.horarioRepository.find();
    if (turnos.length <= 0) {
      throw new BadRequestException('No hay horarios disponibles ');
    }
    return turnos;
  }

  async findOneProfesional(idUser: string) {
    const user = await this.userRepository.findOne({
      where: { idUser: idUser },
      relations: ['profesional', 'profesional.Horario'],
    });
    if (!user || user.role !== userRole.PROFESIONAL) {
      throw new BadRequestException('No se pudo realizar esta accion');
    }
    if (!user.profesional) {
      throw new BadRequestException('No se encontro profesional');
    }

    return user.profesional.Horario;
  }

  async update(
    idUser: string,
    idHorario: string,
    updateHorarioDto: UpdateHorarioDto,
  ) {
    const horarioExiste = await this.horarioRepository.findOne({
      where: { idHorario: idHorario },
      relations: ['Profesional'],
    });
    if (!horarioExiste) {
      throw new NotFoundException('No se encontro horario');
    }
    if (horarioExiste.profesional.UserProfesional.idUser !== idUser) {
      throw new BadRequestException(
        'No tienes permitido modificar este horario',
      );
    }
    this.horarioRepository.merge(
      horarioExiste,
      updateHorarioDto as DeepPartial<Horarios>,
    );
    return await this.horarioRepository.save(horarioExiste);
  }

  async remove(idUser: string, idHorario: string) {
    const findHorario = await this.horarioRepository.findOne({
      where: { idHorario: idHorario },
      relations: ['Profesional'],
    });
    if (!findHorario) {
      throw new NotFoundException('No se encontro horario');
    }
    if (findHorario.profesional.UserProfesional.idUser !== idUser) {
      throw new BadRequestException('No tienes permitido realizar esta accion');
    }
    const deleteHorario = await this.horarioRepository.delete(
      findHorario.idHorario,
    );
    if (!deleteHorario) {
      throw new BadRequestException('No se pudo realizar esta accion');
    } else {
      return { message: 'Horario eliminado' };
    }
  }
}
