import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import {
  ILoginRequest,
  IOrder,
  IProduct,
  IUser,
  OrderStatus,
  Role,
} from '@app/models';
import { StorageService } from '@app/shared';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, concatMap, map, switchMap } from 'rxjs';

interface IState {
  error: string | null;
  users: IUser[]; //for crud on admin dashboard
  products: IProduct[];
  orders: IOrder[];
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  // urls
  private login_url = environment.server_url;
  public all_users = environment.server_url + '/user';
  private product_url = environment.server_url + '/products/';
  private user_url = environment.server_url + '/user/';
  private order_url = environment.server_url + '/orders/';

  // user imports
  private storage = inject(StorageService);
  private router = inject(Router);
  private http = inject(HttpClient);
  private toastr = inject(ToastrService);
  private user = this.storage.get<IUser>('user'); //current user

  // state
  private adminStore = signal<IState>({
    error: null,
    orders: [],
    products: [],
    users: [],
  });

  // features selectors
  selectProducts = computed(() => this.adminStore().products);

  selectInactiveProducts = computed(
    () =>
      this.adminStore().products?.filter((x) => x.status === 'inactive')
        .length || 0
  );
  selectPublsihedProducts = computed(
    () =>
      this.adminStore().products?.filter((x) => x.status === 'publish')
        .length || 0
  );
  selectDraftProducts = computed(
    () =>
      this.adminStore().products?.filter((x) => x.status === 'draft').length ||
      0
  );

  // orders/sales
  selectOrders = computed(() => this.adminStore().orders); //consumed by admin only

  selectTotalOrders = computed(() => this.adminStore().orders?.length || 0);

  selectRejectedOrders = computed(
    () =>
      this.adminStore().orders?.filter((x) => x.status === OrderStatus.rejected)
        .length || 0
  );
  selectPendingOrders = computed(
    () =>
      this.adminStore().orders?.filter((x) => x.status === OrderStatus.pending)
        .length || 0
  );
  selectProcessedOrders = computed(
    () =>
      this.adminStore().orders?.filter(
        (x) => x.status === OrderStatus.processed
      ).length || 0
  );
  selectLastOrder = computed(() =>
    this.adminStore()
      .orders?.map((x) => x.createdAt)
      .at(-1)
  );

  // users
  selectUsers = computed(() =>
    this.adminStore().users?.filter((x) => x.id !== this.user?.id)
  ); // all users excepts the current admin
  selectBuyersCount = computed(
    () =>
      this.adminStore().users?.filter((x) => x.role === Role.buyer).length || 0
  );
  selectSellersCount = computed(
    () =>
      this.adminStore().users?.filter((x) => x.role === Role.seller).length || 0
  );
  selectAdminsCount = computed(
    () =>
      this.adminStore().users?.filter((x) => x.role === Role.admin).length || 0
  );

  // triggers/actions;

  deleteProduct$ = new Subject<{ productId: string }>();
  deleteUser$ = new Subject<{ id: string }>();
  getSingleUser$ = new Subject<{ id: string }>();

  constructor() {
    // users
    this.getAllUsers();
    this.deleteUser();

    // products/Orders
    this.getOrders();
    this.getProducts();
    this.deleteProduct();
  }

  // orders
  private getOrders() {
    // all orders
    this.http
      .get<IOrder[]>(this.order_url)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res) => {
          this.adminStore.update((state) => {
            return {
              ...state,
              orders: res,
            };
          });
        },
        error: (error) => {
          this.adminStore.update((state) => ({ ...state, error }));
          this.toastr.success(`Somthing happened...`);
        },
      });
  }

  // get all products
  private getProducts() {
    // all products
    this.http
      .get<IProduct[]>(this.product_url)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data) => {
          this.adminStore.update((state) => {
            return { ...state, products: data };
          });
        },
        error: (error) => {
          this.adminStore.update((state) => ({ ...state, error }));
        },
      });
  }

  // delete product
  private deleteProduct() {
    this.deleteProduct$
      .pipe(
        switchMap(({ productId }) => {
          return this.http.delete<IProduct>(this.product_url + productId);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => {
          this.adminStore.update((state) => ({
            ...state,
            products: state.products?.filter((x) => x.id !== res.id),
          }));
          this.toastr.success('Deletion complete');
        },
        error: (error) => {
          this.adminStore.update((state) => ({ ...state, error }));
          this.toastr.error('Deletion failed');
        },
      });
  }

  // users
  // get all users
  private getAllUsers() {
    // get all users
    this.http
      .get<IUser[]>(this.user_url)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (data) => {
          this.adminStore.update((state) => {
            return { ...state, users: data };
          });
        },
        error: (error) => {
          this.adminStore.update((state) => ({ ...state, error }));
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
          this.adminStore.update((state) => ({
            ...state,
            users: state.users?.filter((x) => x.id !== res.id),
          }));

          this.toastr.success('Deletion complete');
        },
        error: (error) => {
          this.adminStore.update((state) => ({ ...state, error }));
          this.toastr.error('Deletion failed');
        },
      });
  }

  userDashboardData() {
    return this.http.get(this.user_url);
  }
  productDashboardData() {
    return this.http.get(this.product_url);
  }
  allUser(): Observable<any> {
    return this.http.get(this.all_users);
  }

  addUser(user_dto: any): Observable<any> {
    return this.http.post(this.user_url, user_dto);
  }

  //get data of individual user
  singleUser(user_id: string) {
    return this.http.get(this.user_url + user_id);
  }
  //update data of individual user
  editUser(user_id: string, user_dto: any): Observable<any> {
    return this.http.put(this.user_url + user_id, user_dto);
  }
  //Delete individual user
  // deleteUser(user_id: string) {
  //   return this.http.delete(this.user_url + user_id);
  // }
}
