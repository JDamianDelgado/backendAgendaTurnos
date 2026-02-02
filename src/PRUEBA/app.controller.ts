import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      message: 'Backend funcionando! 🚀',
      timestamp: new Date().toISOString(),
      endpoints: {
        auth: '/auth/login',
        users: '/users',
        turnos: '/turnos',
        profesional: '/profesional',
        horarios: '/horarios',
        mensajes: '/mensajes',
      },
    };
  }

  @Get('health')
  getHealth() {
    return { status: 'healthy', port: process.env.PORT };
  }
}
