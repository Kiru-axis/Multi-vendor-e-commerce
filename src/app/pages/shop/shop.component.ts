import { SlicePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@app/core/services/auth.service';
import { CustomerService } from '@app/core/services/customer.service';
import { ICreateOrder, IOrder, IProduct, IUser } from '@app/models';
import { StorageService } from '@app/shared';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [SlicePipe, RouterLink],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.scss',
})
export class ShopComponent {
  customerService = inject(CustomerService);
  authService = inject(AuthService);
  toastr = inject(ToastrService);
  router = inject(Router);
  storage = inject(StorageService);
  user: IUser | null = this.authService.selectAuthUser();

  quickBuy(productId: string) {
    if (this.user && this.user.role === 'buyer' && this.user.address) {
      // instead of quering the server just filter from the productsArray
      const product = this.customerService
        .selectAllProducts()
        .filter((x) => x.id == productId)[0];

      const request: ICreateOrder = {
        product,
        productId: product.id,
        userId: this.user.id,
        deliveryAddress: this.user.address,
        contact: product.sellerId,
        createdAt: new Date().toString(),
      };

      this.customerService.quickBuy$.next(request);
    }
    // block sellers from buying
    else if (
      this.user &&
      (this.user.role === 'seller' || this.user.role === 'admin')
    ) {
      this.toastr.warning(`${this.user.role}s cannot perform these operation`);
      return;
    }
    // redirect non logged in users to login
    else {
      this.toastr.warning('Login required to proceed');
      this.router.navigateByUrl('/auth/login');
    }
  }

  addToCart(productId: string) {
    if (this.user && this.user.role === 'buyer' && this.user.address) {
      // instead of quering the server just filter from the productsArray
      const product = this.customerService
        .selectAllProducts()
        .filter((x) => x.id == productId)[0];

      const request: ICreateOrder = {
        product,
        productId: product.id,
        userId: this.user.id,
        deliveryAddress: this.user.address,
        contact: product.sellerId,
        createdAt: new Date().toString(),
      };

      //   // check if the product is already in cart
      const alreadyAdded = this.storage.get<ICreateOrder>('cart');

      const match =
        (request.userId && request.productId) ===
        (alreadyAdded?.userId && alreadyAdded?.productId);
      if (match) {
        this.toastr.warning('These product has already been added to cart');
        return;
      } else {
        this.storage.set('cart', request);
        this.toastr.info('Product added to cart, You are ready for checkout');
        this.router.navigateByUrl('/checkout');
        return;
      }
    }
    // block sellers from buying
    else if (
      this.user &&
      (this.user.role === 'seller' || this.user.role === 'admin')
    ) {
      this.toastr.warning(`${this.user.role}s cannot perform these operation`);
      return;
    }
    // redirect non logged in users to login
    else {
      this.toastr.warning('Login required to proceed');
      this.router.navigateByUrl('/auth/login');
    }
  }
}
