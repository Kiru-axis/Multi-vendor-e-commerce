import { Component, OnInit, inject } from '@angular/core';
import { CustomerService } from '@app/core/services/customer.service';
import { DatePipe, SlicePipe } from '@angular/common';
import { AuthService } from '@app/core/services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [SlicePipe, DatePipe, RouterLink],
  templateUrl: './buyer-dashboard.component.html',
  styleUrl: './buyer-dashboard.component.scss',
})
export class BuyerDashboardComponent {
  public customerService = inject(CustomerService);

  user = inject(AuthService).selectAuthUser();
}
