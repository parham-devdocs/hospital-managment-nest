import { PartialType } from '@nestjs/mapped-types';
import { SignUpAuthDto } from './signup-auth.dto';

export class UpdateAuthDto extends PartialType(SignUpAuthDto) {}
