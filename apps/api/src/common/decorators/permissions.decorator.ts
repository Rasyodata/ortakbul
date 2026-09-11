import { SetMetadata } from '@nestjs/common';
import { PermissionCode } from '../enums/permission.enum';

export const PERMISSIONS_KEY = 'requiredPermissions';
export const RequirePermissions = (...perms: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, perms);
