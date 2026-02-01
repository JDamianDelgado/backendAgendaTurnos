import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { TurnosService } from './turnos.service';
import { CreateTurnoDto } from './dto/create-turno.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { userRole } from 'src/auth/entities/auth.entity';

@Controller('turnos')
export class TurnosController {
  constructor(private readonly turnosService: TurnosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('slots/:idProfesional/:fecha')
  @Roles('PACIENTE', 'PROFESIONAL')
  turnosDisponiblesSlots(
    @Param('idProfesional') idProfesional: string,
    @Param('fecha') fecha: string,
  ) {
    return this.turnosService.TurnosDisponibles(idProfesional, fecha);
  }

  //SACAR TURNO PACIENTE
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PACIENTE')
  reservarTurno(
    @CurrentUser() user: { sub: string; role: userRole },
    @Body() createTurnoDto: CreateTurnoDto,
  ) {
    return this.turnosService.create(user.sub, createTurnoDto);
  }

  @Get('misturnos')
  @UseGuards(JwtAuthGuard)
  misTurnosPaciente(@CurrentUser() user: { sub: string; role: userRole }) {
    return this.turnosService.misTurnos(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('cancelar')
  @Roles('PACIENTE')
  cancelarTurnoPaciente(
    @CurrentUser() user: { sub: string },
    @Body() body: { idTurno: string },
  ) {
    return this.turnosService.cancelarTurnoPaciente(user.sub, body.idTurno);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch('cancelar-profesional')
  @Roles('PROFESIONAL')
  cancelarTurnoProfesional(
    @CurrentUser() user: { sub: string },
    @Body() body: { idTurno: string },
  ) {
    return this.turnosService.cancelarTurnoPorProfesional(
      user.sub,
      body.idTurno,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete('/eliminar/:idTurno')
  @Roles('PACIENTE', 'PROFESIONAL')
  cancelarTurno(@Param('idTurno') idTurno: string) {
    return this.turnosService.deleteTurno(idTurno);
  }
}
