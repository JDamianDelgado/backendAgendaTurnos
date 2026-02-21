import { PartialType } from '@nestjs/mapped-types';
import { CreateConversacionDto } from './create-conversacion.dto';

export class UpdateConversacionDto extends PartialType(CreateConversacionDto) {}
