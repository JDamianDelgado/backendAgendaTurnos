import {
  BadRequestException,
  ForbiddenException,
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
      throw new BadRequestException('Datos incompletos');
    }

    const user = await this.userRepository.findOne({
      where: { idUser: id },
      relations: ['profesional'],
    });

    if (!user || user.role !== userRole.PROFESIONAL) {
      throw new BadRequestException('No se puede realizar esta acción');
    }

    if (!user.profesional?.idProfesional) {
      throw new BadRequestException('Crea tu perfil profesional');
    }
    const existeHorario = await this.horarioRepository.findOne({
      where: {
        dia: data.dia,
        profesional: {
          idProfesional: user.profesional.idProfesional,
        },
      },
      relations: ['profesional'],
    });

    if (existeHorario) {
      throw new BadRequestException(
        `Ya existe un horario creado para el día ${data.dia}`,
      );
    }
    const { dia, horaInicio, horaFin, duracionTurno, activo } = data;

    const nuevoHorario = this.horarioRepository.create({
      dia,
      horaInicio,
      horaFin,
      duracionTurno,
      activo: activo ?? true,
      profesional: user.profesional,
    });

    const saved = await this.horarioRepository.save(nuevoHorario);

    if (!saved) {
      throw new BadRequestException('No se pudo crear el horario');
    }

    return saved;
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
      relations: {
        profesional: {
          UserProfesional: true,
        },
      },
    });

    const user = await this.userRepository.findOne({
      where: { idUser: idUser },
      relations: ['profesional'],
    });

    if (!user || user.role !== userRole.PROFESIONAL) {
      throw new BadRequestException('No se pudo realizar esta accion');
    }
    if (!horarioExiste) {
      throw new NotFoundException('No se encontro horario');
    }

    this.horarioRepository.merge(
      horarioExiste,
      updateHorarioDto as DeepPartial<Horarios>,
    );
    return await this.horarioRepository.save(horarioExiste);
  }

  async remove(idUser: string, idHorario: string) {
    const findHorario = await this.horarioRepository.findOne({
      where: { idHorario },
      relations: {
        profesional: {
          UserProfesional: true,
        },
      },
    });

    if (!findHorario) {
      throw new NotFoundException('No se encontró el horario');
    }

    if (findHorario.profesional.UserProfesional.idUser !== idUser) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este horario',
      );
    }

    try {
      await this.horarioRepository.delete(idHorario);
      return idHorario;
    } catch (error) {
      throw new BadRequestException(
        'No se puede eliminar el horario porque tiene turnos asociados',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        error,
      );
    }
  }
  async horariosProfesional(idProfesional: string) {
    const profesional = await this.profesionalRepository.findOne({
      where: { idProfesional: idProfesional },
      relations: ['Horario'],
    });

    if (!profesional) {
      throw new BadRequestException('No se encontro profesional');
    }
    return profesional.Horario;
  }
}
