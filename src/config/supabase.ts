import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Profesional } from 'src/profesional/entities/profesional.entity';
import { Turnos } from 'src/turnos/entities/turno.entity';
import { Auth } from 'src/auth/entities/auth.entity';
import { Horarios } from 'src/horarios/entities/horario.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DB_URL,
  autoLoadEntities: true,
  entities: [User, Profesional, Turnos, Auth, Horarios],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
};
