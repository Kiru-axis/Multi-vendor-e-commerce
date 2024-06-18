import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ICreateOrder, IOrder, IProduct, OrderStatus } from '@app/models';
import { StorageService } from '@app/shared';
import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Subject, switchMap } from 'rxjs';
import { AuthService } from './auth.service';

interface ICustomerStore {
  error: string | null;

  products: IProduct[];

  product: IProduct | null;

  sales: IOrder[];
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private toastr = inject(ToastrService);

  private product_url = environment.server_url + '/products/';
  private user_url = environment.server_url + '/user/';
  private order_url = environment.server_url + '/orders/';

  // can be buyer/seller/admin
  private user = inject(AuthService).selectAuthUser();

  private customerStore = signal<ICustomerStore>({
    error: null,
    products: [],
    product: null,
    sales: [],
  });

  // selectors
  // seller specific
  // products
  selectSellerProducts = computed(() =>
    this.customerStore().products?.filter((x) => x.sellerId === this.user?.id)
  );

  selectInactiveProducts = computed(
    () =>
      this.customerStore().products?.filter(
        (x) => x.sellerId === this.user?.id && x.status === 'inactive'
      ).length || 0
  );
  selectPublsihedProducts = computed(
    () =>
      this.customerStore().products?.filter(
        (x) => x.sellerId === this.user?.id && x.status === 'publish'
      ).length || 0
  );
  selectDraftProducts = computed(
    () =>
      this.customerStore().products?.filter(
        (x) => x.sellerId === this.user?.id && x.status === 'draft'
      ).length || 0
  );

  // orders/sales
  selectOrders = computed(() => this.customerStore().sales); //consumed by admin only

  selectSellerSales = computed(() =>
    this.customerStore().sales?.filter(
      (x) => x.product.sellerId === this.user?.id
    )
  );
  selectTotalSales = computed(
    () =>
      this.customerStore().sales?.filter(
        (x) => x.product.sellerId === this.user?.id
      ).length || 0
  );
  selectRejectedSales = computed(
    () =>
      this.customerStore().sales?.filter(
        (x) =>
          x.product.sellerId === this.user?.id &&
          x.status === OrderStatus.rejected
      ).length || 0
  );
  selectPendingSales = computed(
    () =>
      this.customerStore().sales?.filter(
        (x) =>
          x.product.sellerId === this.user?.id &&
          x.status === OrderStatus.pending
      ).length || 0
  );
  selectProcessedSales = computed(
    () =>
      this.customerStore().sales?.filter(
        (x) =>
          x.product.sellerId === this.user?.id &&
          x.status === OrderStatus.processed
      ).length || 0
  );
  selectLastSale = computed(() =>
    this.customerStore()
      .sales?.map((x) => x.createdAt)
      .at(-1)
  );

  // products

  selectAllProducts = computed(() => this.customerStore().products);
  selectSingleProduct = computed(() => this.customerStore().product);
  // selecAllProducts = computed(() => this.customerStore().products);

  // buyerspecific
  selectPurchases = computed(() =>
    this.customerStore().sales?.filter((x) => x.userId === this.user?.id)
  );

  // triggers/actions -> Seller/Admin
  addNewProduct$ = new Subject<IProduct>();
  deleteProduct$ = new Subject<{ productId: string }>();
  getSingleProduct$ = new Subject<{ productId: string }>();
  editProduct$ = new Subject<{
    req: { dto: Partial<IProduct>; productId: string };
  }>();

  // triggers/actions -> Buyer
  quickBuy$ = new Subject<ICreateOrder>();

  constructor() {
    this.getOrders();
    this.getProducts();
    this.addNewProduct();
    this.getSingleProduct();
    this.editProduct();
    this.deleteProduct();
    this.quickBuy();
  }

  // orders
  private getOrders() {
    // all orders
    this.http
      .get<IOrder[]>(this.order_url)
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (res) => {
          this.customerStore.update((state) => {
            return {
              ...state,
              sales: res,
            };
          });
        },
        error: (error) => {
          this.customerStore.update((state) => ({ ...state, error }));
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
          this.customerStore.update((state) => {
            return { ...state, products: data };
          });
        },
        error: (error) => {
          this.customerStore.update((state) => ({ ...state, error }));
        },
      });
  }

  // get single product
  private getSingleProduct() {
    this.getSingleProduct$
      .pipe(
        switchMap(({ productId }) => {
          return this.http.get<IProduct>(this.product_url + productId);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => {
          this.customerStore.update((state) => {
            return {
              ...state,
              product: res,
            };
          });
        },
        error: (error) => {
          this.customerStore.update((state) => ({ ...state, error }));
        },
      });
  }

  // add new product
  private addNewProduct() {
    this.addNewProduct$
      .pipe(
        switchMap((data) => {
          return this.http.post<IProduct>(this.product_url, data);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => {
          this.customerStore.update((state) => ({
            ...state,
            products: state.products?.concat(res),
          }));
          this.toastr.success('Product added');
        },
        error: (error) => {
          this.customerStore.update((state) => ({ ...state, error }));
          this.toastr.error('Product addition failed');
        },
      });
  }

  // edit product
  private editProduct() {
    this.editProduct$
      .pipe(
        switchMap(({ req }) => {
          return this.http.put<IProduct>(
            this.product_url + req.productId,
            req.dto
          );
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => {
          this.customerStore.update((state) => ({
            ...state,
            products: state.products?.map((x) =>
              x.id === res.id ? Object.assign({}, x, res) : x
            ),
            product:
              state.product?.id === res.id
                ? Object.assign({}, state.product, res)
                : state.product,
          }));

          this.toastr.success('Product update success');
        },
        error: (error) => {
          this.customerStore.update((state) => ({ ...state, error }));
          this.toastr.error('Product update failed');
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
          this.customerStore.update((state) => ({
            ...state,
            products: state.products?.filter((x) => x.id !== res.id),
            product: state.product === res ? null : state.product,
          }));
          this.toastr.success('Deletion complete');
        },
        error: (error) => {
          this.customerStore.update((state) => ({ ...state, error }));
          this.toastr.error('Deletion failed');
        },
      });
  }

  // quick buy
  private quickBuy() {
    this.quickBuy$
      .pipe(
        switchMap((data) => {
          const d = { ...data, status: OrderStatus.processed };
          return this.http.post<IOrder>(this.order_url, d);
        }),
        takeUntilDestroyed()
      )
      .subscribe({
        next: (res) => {
          this.customerStore.update((state) => ({
            ...state,
            sales: [...state.sales].concat(res),
          }));
          this.toastr.success(`Purchase success`);
        },
        error: (error) => {
          this.customerStore.update((state) => ({ ...state, error }));
          this.toastr.success(`Somthing happened during the buying process`);
        },
      });
  }
}
// export class CustomerService {
//   // angular
//   http = inject(HttpClient);

//   // user defined
//   private product_url = environment.server_url + '/products/';
//   private user_url = environment.server_url + '/user/';
//   private order_url = environment.server_url + '/orders/';

//   private storage = inject(StorageService);
//   private toastr = inject(ToastrService);
//   // state
//   private customerStore = signal<ICustomerStore>({
//     user: this.storage.get('user'),
//     orders: [],
//     error: null,
//   });

//

//   selectCustomer = computed(() => this.customerStore().user);
//   selectOrders = computed(() => this.customerStore().orders);
//   selectError = computed(() => this.customerStore().error);
//   selectUserOrders = (userId: string) =>
//     computed(() =>
//       this.customerStore().orders?.filter((x) => x.userId === userId)
//     );
//   selectSales = (product.sellerId: string) =>
//     computed(() =>
//       this.customerStore().orders?.filter(
//         (x) => x.product.sellerId === sellerId
//       )
//     );

//   // triggers / actions
//   quickBuy$ = new Subject<ICreateOrder>();

//   // handlers in constructor;
//   constructor() {
//     // all orders
//     this.http
//       .get<IOrder[]>(this.order_url)
//       .pipe(takeUntilDestroyed())
//       .subscribe({
//         next: (res) => {
//           this.customerStore.update((state) => ({
//             ...state,
//             orders: res,
//           }));
//         },
//         error: (error) => {
//           this.customerStore.update((state) => ({ ...state, error }));
//           this.toastr.success(`Somthing happened...`);
//         },
//       });

//     // quick buy
//     this.quickBuy$
//       .pipe(
//         switchMap((data) => {
//           const d = { ...data, status: OrderStatus.processed };
//           return this.http.post<IOrder>(this.order_url, d);
//         }),

//         takeUntilDestroyed()
//       )
//       .subscribe({
//         next: (res) => {
//           this.customerStore.update((state) => ({
//             ...state,
//             orders: [...(state.orders as IOrder[]), res],
//           }));
//           this.toastr.success(`Purchase success`);
//         },
//         error: (error) => {
//           this.customerStore.update((state) => ({ ...state, error }));
//           this.toastr.success(`Somthing happened during the buying process`);
//         },
//       });
//   }

//   private single_product_id = new BehaviorSubject<string | null>(null);
//   currentProduct = this.single_product_id.asObservable();

//   individualProduct(id: number): Observable<any> {
//     return this.http.get(this.product_url + id);
//   }
//   userDetail(id: number): Observable<any> {
//     return this.http.get(this.user_url + id);
//   }
//   insertNewOrder(order_dto: any): Observable<any> {
//     return this.http.post(this.order_url, order_dto);
//   }

//   orderDashboardData(): Observable<any> {
//     return this.http.get(this.order_url);
//   }
//   productDashboardData(): Observable<any> {
//     return this.http.get(this.product_url);
//   }

//   // private checkProductInCart(productId: string): IProduct | null {
//   //   const check = this.customerStore().cart?.find((x) => x.id == productId);
//   //   return check ? check : null;
//   // }
// }
