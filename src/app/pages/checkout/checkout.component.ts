import { Component, inject, signal } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { ICreateOrder } from '@app/models';
import { CustomerService } from '@app/core/services/customer.service';
import { StorageService } from '@app/shared';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent {
  public authService = inject(AuthService); //has to be public else the template cant access it
  storage = inject(StorageService);
  customerService = inject(CustomerService);

  user = this.authService.selectAuthUser();

  cartData = signal(this.storage.get<ICreateOrder>('cart'));

  placeOrder() {
    if (
      this.cartData &&
      this.user &&
      this.user.role === 'buyer' &&
      this.user.address
    ) {
      this.customerService.quickBuy$.next(this.cartData() as ICreateOrder);
      this.storage.remove('cart');
      this.cartData.update((x) => null);
      return;
    }
  }
}
