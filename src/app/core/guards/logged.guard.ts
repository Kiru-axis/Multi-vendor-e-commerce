import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IUser } from '@app/models';
import { StorageService } from '@app/shared';

export const loggedGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const user = inject(StorageService).get<IUser>('user');

  // console.log(user);
  if (user) {
    router.navigateByUrl('/');
    return false;
  } else {
    return true;
  }
};
