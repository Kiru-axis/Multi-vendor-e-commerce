import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '@app/shared';
import { IUser } from '@app/models';

export const authGuard: CanActivateFn = (route, state) => {
  const user = inject(StorageService).get<IUser>('user');
  const router = inject(Router);

  if (!user) {
    router.navigateByUrl('/auth/login');
    return false;
  }

  return true;
};
