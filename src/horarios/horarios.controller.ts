import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HorariosService } from './horarios.service';
import { CreateHorarioDto } from './dto/create-horario.dto';
import { UpdateHorarioDto } from './dto/update-horario.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { userRole } from 'src/auth/entities/auth.entity';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('horarios')
export class HorariosController {
  constructor(private readonly horariosService: HorariosService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('PROFESIONAL')
  create(
    @CurrentUser() user: { sub: string; role: userRole },
    @Body() createHorarioDto: CreateHorarioDto,
  ) {
    return this.horariosService.create(user.sub, user.role, createHorarioDto);
  }

  @Get()
  findAll() {
    return this.horariosService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/misHorarios')
  @Roles('PROFESIONAL')
  MisTurnos(@CurrentUser() user: { sub: string }) {
    return this.horariosService.findOneProfesional(user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':idHorario')
  @Roles('PROFESIONAL')
  update(
    @CurrentUser() user: { sub: string },

    @Param('idHorario') idHorario: string,
    @Body() updateHorarioDto: UpdateHorarioDto,
  ) {
    return this.horariosService.update(user.sub, idHorario, updateHorarioDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':idHorario')
  @Roles('PROFESIONAL')
  remove(
    @CurrentUser() user: { sub: string },
    @Param('idHorario') idHorario: string,
  ) {
    return this.horariosService.remove(user.sub, idHorario);
  }
}
