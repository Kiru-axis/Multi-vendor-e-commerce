import { Routes } from '@angular/router';
import { SellerDashboardComponent } from './pages/seller-dashboard/seller-dashboard.component';

export const seller_routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: SellerDashboardComponent },
];
