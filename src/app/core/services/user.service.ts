import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUser } from '@app/models';
import { StorageService } from '@app/shared';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, concatMap, map, switchMap, take } from 'rxjs';
import { CustomerService } from './customer.service';

interface IState {
  users: IUser[];
  user: IUser | null;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private user_url = environment.server_url + '/user/';

  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private storage = inject(StorageService);
  private customerService = inject(CustomerService); // whwn you delete user, also delete their products and orders
  private user = this.storage.get<IUser>('user'); //current user

  // state
  private userStore = signal<IState>({
    users: [],
    user: null,
    error: null,
  });

  // selectors
  selectUser = computed(() => this.userStore().user);
  selectError = computed(() => this.userStore().error);
  selectUsers = computed(() =>
    this.userStore().users?.filter((x) => x.id !== this.user?.id)
  ); // all users excepts the current admin

  // actions
  getSingleUser$ = new Subject<{ id: string }>();
  deleteUser$ = new Subject<{ id: string }>();
  updateUser$ = new Subject<{ request: { dto: Partial<IUser>; id: string } }>();

  // effects
  constructor() {
    this.getAllUsers();

    this.getSingleUser();

    this.deleteUser();

    this.updateUser();
  }
  // get all users
  private getAllUsers() {
    // get all users
    this.http
      .get<IUser[]>(this.user_url)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data) => {
          this.userStore.update((state) => {
            return { ...state, users: data };
          });
        },
        error: (error) => {
          this.userStore.update((state) => ({ ...state, error }));
        },
      });
  }

  // get single user
  private getSingleUser() {
    this.getSingleUser$
      .pipe(
        switchMap(({ id }) => {
          return this.http.get<IUser>(this.user_url + id);
        }),
        take(1),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => {
          this.userStore.update((state) => {
            const updates = {
              ...state,
              user: res,
            };

            return updates;
          });
        },
        error: (error) => {
          this.userStore.update((state) => ({ ...state, error }));
        },
      });
  }

  // delete user;
  private deleteUser() {
    this.deleteUser$
      .pipe(
        switchMap(({ id }) => {
          return this.http.delete<IUser>(this.user_url + id);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => {
          this.userStore.update((state) => ({
            ...state,
            users: state.users?.filter((x) => x.id !== res.id),
            user: state.user === res ? null : state.user,
          }));

          this.toastr.success('Deletion complete');
        },
        error: (error) => {
          this.userStore.update((state) => ({ ...state, error }));
          this.toastr.error('Deletion failed');
        },
      });
  }

  // update user
  private updateUser() {
    this.updateUser$
      .pipe(
        switchMap(({ request }) => {
          return this.http.put<IUser>(this.user_url + request.id, request.dto);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => {
          this.userStore.update((state) => ({
            ...state,
            users: state.users?.map((x) =>
              x.id == res.id ? Object.assign({}, x, res) : x
            ),
            user:
              state.user === res
                ? Object.assign({}, state.user, res)
                : state.user,
          }));
          this.toastr.success('User update complete');

          // update the sessionStorage
          const _user = this.storage.get<IUser>('user');

          this.storage.set<IUser>('user', { ..._user, ...res });
        },
        error: (error) => {
          this.userStore.update((state) => ({ ...state, error }));
          this.toastr.error('User update failed');
        },
      });
  }

  // //get data of individual user
  // getUserData(user_id: string): Observable<IUser> {
  //   return this.http.get<IUser>(this.user_url + user_id);
  // }
  // //update data of individual user
  // updateUserData(user_id: string, dto: Partial<IUser>): Observable<IUser> {
  //   return this.http.put<IUser>(this.user_url + user_id, dto);
  // }
}
