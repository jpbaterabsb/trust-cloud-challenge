import { SetMetadata } from '@nestjs/common';
import { Role } from './entities/roles';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
