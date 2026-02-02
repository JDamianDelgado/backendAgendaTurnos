'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.typeOrmConfig = void 0;
require('dotenv/config');
const user_entity_1 = require('../src/users/entities/user.entity');
const profesional_entity_1 = require('../src/profesional/entities/profesional.entity');
const turno_entity_1 = require('../src/turnos/entities/turno.entity');
const auth_entity_1 = require('../src/auth/entities/auth.entity');
const horario_entity_1 = require('../src/horarios/entities/horario.entity');
exports.typeOrmConfig = {
  type: 'postgres',
  url: process.env.DB_URL,
  autoLoadEntities: true,
  entities: [
    user_entity_1.User,
    profesional_entity_1.Profesional,
    turno_entity_1.Turnos,
    auth_entity_1.Auth,
    horario_entity_1.Horarios,
  ],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
};
//# sourceMappingURL=supabase.js.map
