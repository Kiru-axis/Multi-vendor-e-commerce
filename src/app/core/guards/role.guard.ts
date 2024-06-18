import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IUser } from '@app/models';
import { StorageService } from '@app/shared';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const user = inject(StorageService).get('user') as IUser | null;
  const requiredRole = route.data['requiredRole'];

  if (user) {
    if (requiredRole === user.role) {
      return true;
    }
  }
  router.navigateByUrl('/');

  return false;
};
