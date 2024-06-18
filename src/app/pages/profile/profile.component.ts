import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminProfileComponent } from '@app/features/admin/pages/admin-profile/admin-profile.component';
import { BuyerProfileComponent } from '@app/features/buyer/pages/buyer-profile/buyer-profile.component';
import { AuthService } from '@app/core/services/auth.service';
import { UserService } from '@app/core/services/user.service';
import { SellerProfileComponent } from '@app/features/seller/pages/seller-profile/seller-profile.component';
import { Subject, takeUntil } from 'rxjs';
import { StorageService } from '@app/shared';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    AdminProfileComponent,
    BuyerProfileComponent,
    SellerProfileComponent,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnDestroy {
  activatedRoute = inject(ActivatedRoute);

  router = inject(Router);

  destroy$ = new Subject<void>();

  public userService = inject(UserService);

  public authService = inject(AuthService);

  private storage = inject(StorageService);

  constructor() {
    effect(() => {
      this.activatedRoute.paramMap
        .pipe(takeUntil(this.destroy$))
        .subscribe((param) => {
          const id = String(param.get('id'));
          this.userService.getSingleUser$.next({ id });
          const profile = this.userService.selectUser();
          const user = this.authService.selectAuthUser();
          if (user?.role !== 'admin' && profile?.role == 'admin') {
            this.storage.set('profile', user);
            return;
          } else {
            this.storage.set('profile', profile);
          }
        });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
