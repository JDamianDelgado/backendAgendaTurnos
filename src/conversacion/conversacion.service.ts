// import { Injectable } from '@nestjs/common';
// // import { CreateConversacionDto } from './dto/create-conversacion.dto';
// // import { UpdateConversacionDto } from './dto/update-conversacion.dto';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Conversacion } from './entities/conversacion.entity';
// import { Repository } from 'typeorm';
// import { estadoTurno, Turnos } from 'src/turnos/entities/turno.entity';

// @Injectable()
// export class ConversacionService {
//   constructor(
//     @InjectRepository(Conversacion)
//     private readonly conversacionRepository: Repository<Conversacion>,
// @InjectRepository(Turnos)
// private readonly turnoRepository: Repository<Turnos>,
// ) {}

// async newChat(idTurno: string, idUser: string) {
//   const turno = await this.turnoRepository.findOne({
//     where: { idTurno: idTurno },
//     relations: ['user', 'profesional'],
//   });
//   if (!turno || idUser !== turno.user.idUser) {
//     throw new BadRequestException('No se puede realizar esta accion');
//   }

//   if (
//     turno.estado === estadoTurno.CANCELADO ||
//     turno.estado === estadoTurno.COMPLETADO
//   ) {
//     throw new BadRequestException('Turno ya finalizado');
//   }
//   const conversacionExistente = await this.conversacionRepository.findOne({
//     where: { turno: { idTurno } },
//   });

//   if (conversacionExistente) {
//     return conversacionExistente;
//   }

//     const newChat = this.conversacionRepository.create({
//       turno: turno,
//       paciente: turno.user,
//       profesional: turno.profesional,
//       mensajes: [],
//     });
//     return await this.conversacionRepository.save(newChat);
//   }
