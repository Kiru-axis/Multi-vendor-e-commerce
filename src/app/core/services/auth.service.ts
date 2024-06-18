import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ILoginRequest, IRegisterRequest, IUser } from '@app/models';
import { StorageService } from '@app/shared';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subject, concatMap, map } from 'rxjs';

interface IState {
  authUser: IUser | null;
  error: string | null;
  logged_in: boolean;
}

function checkLoggedIn() {
  return sessionStorage.getItem('user') ? true : false;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private login_url = environment.server_url;
  private reg_url = environment.server_url;
  private storage = inject(StorageService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);

  // state
  private authStore = signal<IState>({
    authUser: this.storage.get('user') as IUser | null,
    error: null,
    logged_in: checkLoggedIn(),
  });

  // selectors
  selectAuthUser = computed(() => this.authStore().authUser);
  selectError = computed(() => this.authStore().error);
  selectLogged_in = computed(() => this.authStore().logged_in);

  // triggers/actions;
  login$ = new Subject<ILoginRequest>();
  logout$ = new Subject<void>();
  register$ = new Subject<IRegisterRequest>();

  constructor() {
    this.login();
    this.logout();
    this.register();
  }

  private login() {
    this.login$
      .pipe(
        concatMap((dto) => {
          return this.http.get<IUser[]>(
            this.login_url +
              '/user?email=' +
              dto.email +
              '&password=' +
              dto.password
          );
        }),
        map((data) => data[0]),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (user) => {
          if (user) {
            // update the store
            this.authStore.update((state) => ({
              ...state,
              authUser: user,
              logged_in: true,
            }));

            // WARNING!!!!
            // WE ARE PUTTING THE WHOLE USER OBJECT INCLUDING PASSWORD TO SESSIONSTORAGE
            // DONT DO THESE IN PRODUCTION

            // redirect based on login role
            switch (user.role) {
              case 'buyer':
                this.storage.set('user', user);
                this.router.navigateByUrl('/buyer');
                break;
              case 'seller':
                this.storage.set('user', user);
                this.router.navigateByUrl('/seller');
                break;
              default:
              case 'admin':
                const admin_url = '/auth/admin/admin-login';
                if (this.router.url !== admin_url) {
                  this.toastr.error('Invalid credentials');
                  return;
                }
                this.storage.set('user', user);
                this.router.navigateByUrl('/admin');
                break;
            }
          } else {
            this.toastr.error('Invalid credentials');
            return;
          }
        },
        error: (error) => {
          this.authStore.update((state) => ({
            ...state,
            error,
            logged_in: false,
            user: null,
          }));
        },
      });
  }

  private logout() {
    this.logout$.pipe(takeUntilDestroyed()).subscribe({
      next: () => {
        // update the store
        this.authStore.update((state) => ({
          ...state,
          authUser: null,
          error: null,
        }));

        this.storage.remove('user');
        this.storage.remove('profile'); //if any
        this.router.navigateByUrl('/');
      },
      error: (error) => {
        this.authStore.update((state) => ({ ...state, error }));
      },
    });
  }

  private register() {
    this.register$
      .pipe(
        concatMap((dto) => {
          return this.http.post<IUser>(this.reg_url + '/user', dto);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (user) => {
          this.toastr.success(`Account for ${user.name} created`);
          this.router.navigateByUrl('/auth/login');
        },
        error: (error) => {
          this.authStore.update((state) => ({ ...state, error }));
        },
      });
  }
}
