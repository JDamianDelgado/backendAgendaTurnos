import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}
  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    if (!users || users.length === 0) {
      throw new NotFoundException('No se encontraron usuarios');
    }
    return users;
  }

  async findOne(id: string): Promise<User | string> {
    const user = await this.userRepository.findOne({
      where: { idUser: id },
      relations: ['turnos'],
    });
    if (!user) {
      throw new NotFoundException('No se encontro usuario');
    }
    return user;
  }

  async modifyUser(id: string, data: Partial<User>): Promise<User | string> {
    const user = await this.userRepository.findOne({ where: { idUser: id } });

    if (!user) {
      throw new NotFoundException('No se encontro usuario');
    }
    const updatedUser = this.userRepository.merge(user, data);

    return this.userRepository.save(updatedUser);
  }

  async deleteUser(id: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { idUser: id } });

    if (!user) {
      throw new NotFoundException('No se encontro usuario');
    }

    const deleteUser = await this.userRepository.remove(user);

    if (!deleteUser) {
      throw new BadRequestException('No se pudo eliminar Usuario');
    }
    return id;
  }
}
