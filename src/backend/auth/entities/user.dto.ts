import { OEM } from '@prisma/client';

export type User = OEM & {
  roles: string[];
};
