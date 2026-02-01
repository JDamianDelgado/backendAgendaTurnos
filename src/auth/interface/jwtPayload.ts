import { userRole } from '../entities/auth.entity';

export interface JwtPayload {
  sub: string;
  role: userRole;
}
