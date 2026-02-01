import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ProfesionalService } from './profesional.service';
import { CreateProfesionalDto } from './dto/create-profesional.dto';
import { UpdateProfesionalDto } from './dto/update-profesional.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { userRole } from 'src/auth/entities/auth.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('profesional')
export class ProfesionalController {
  constructor(private readonly profesionalService: ProfesionalService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @Roles('PROFESIONAL')
  create(
    @CurrentUser() user: { sub: string; role: userRole },
    @Body() createProfesionalDto: CreateProfesionalDto,
  ) {
    return this.profesionalService.create(user.sub, createProfesionalDto);
  }

  @Get()
  findAll() {
    return this.profesionalService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get('/miPerfil')
  @Roles('PROFESIONAL')
  findOne(@CurrentUser() user: { sub: string; role: userRole }) {
    return this.profesionalService.findOne(user.sub, user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch()
  @Roles('PROFESIONAL')
  update(
    @CurrentUser() user: { sub: string; role: userRole },
    @Body() updateProfesionalDto: UpdateProfesionalDto,
  ) {
    return this.profesionalService.update(user.sub, updateProfesionalDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete()
  @Roles('PROFESIONAL')
  deleteUser(@CurrentUser() user: { sub: string; role: userRole }) {
    return this.profesionalService.deleteUser(user.sub);
  }
}
