import 'dotenv/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: process.env.DB_URL,
  autoLoadEntities: true,
  entities: [User],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
};
