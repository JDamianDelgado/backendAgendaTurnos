import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Profesional } from './entities/profesional.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { userRole } from 'src/auth/entities/auth.entity';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';

@Injectable()
export class ProfesionalService {
  constructor(
    @InjectRepository(Profesional)
    private profesionalRepository: Repository<Profesional>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(id: string, createProfesionalDto: CreateProfesionalDto) {
    const user = await this.userRepository.findOne({ where: { idUser: id } });
    if (!user || user.role !== userRole.PROFESIONAL) {
      throw new BadRequestException('No estás autorizado');
    }

    const existeProfesional = await this.profesionalRepository.findOne({
      where: { UserProfesional: { idUser: user.idUser } },
    });

    if (existeProfesional) {
      throw new BadRequestException('Ya tenés un perfil profesional');
    }

    const profesional = this.profesionalRepository.create({
      UserProfesional: user,
      imagenUrl: createProfesionalDto.imagenUrl,
      especialidad: createProfesionalDto.especialidad,
      descripcion: createProfesionalDto.descripcion,
      activo: createProfesionalDto.activo ?? true,
      TurnosProfesional: [],
      Horario: [],
    });

    return this.profesionalRepository.save(profesional);
  }

  async findAll() {
    return await this.profesionalRepository.find({
      relations: {
        UserProfesional: true,
        TurnosProfesional: true,
        Horario: true,
      },
    });
  }

  async findOne(sub: string, role: userRole) {
    const prof = await this.userRepository.findOne({
      where: { idUser: sub },
      relations: {
        profesional: {
          TurnosProfesional: {
            user: true,
          },
          Horario: true,
        },
      },
      select: {
        idUser: true,
        nombre: true,
        apellido: true,
        email: true,
        role: true,

        profesional: {
          idProfesional: true,
          descripcion: true,
          especialidad: true,
          imagenUrl: true,
          TurnosProfesional: {
            idTurno: true,
            fecha: true,
            hora: true,
            estado: true,
            creado: true,
            user: {
              idUser: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          Horario: true,
        },
      },
    });

    if (!prof || role !== userRole.PROFESIONAL) {
      throw new NotFoundException('No se encontro profesional');
    }
    return prof;
  }

  async update(id: string, updateProfesionalDto: UpdateProfesionalDto) {
    const user = await this.userRepository.findOne({
      where: { idUser: id },
    });
    if (!user || user.role !== userRole.PROFESIONAL) {
      throw new BadRequestException('No esta autorizado');
    }
    const perfilProfesional = await this.profesionalRepository.findOne({
      where: { UserProfesional: { idUser: user.idUser } },
    });
    if (!perfilProfesional) {
      throw new BadRequestException('No esta autorizado');
    }

    const profesionalData = this.profesionalRepository.merge(
      perfilProfesional,
      updateProfesionalDto,
    );

    return await this.profesionalRepository.save(profesionalData);
  }

  async deleteUser(id: string) {
    const profesionalDelete = await this.profesionalRepository.findOne({
      where: { UserProfesional: { idUser: id } },
      relations: ['UserProfesional'],
    });
    if (!profesionalDelete) {
      throw new BadRequestException('No se encontro profesional');
    }
    const deleteProfesional = await this.profesionalRepository.delete(
      profesionalDelete.idProfesional,
    );
    if (!deleteProfesional) {
      throw new BadRequestException('No se pudo eliminar ');
    }
    return 'Perfil profesional eliminado ';
  }
}
