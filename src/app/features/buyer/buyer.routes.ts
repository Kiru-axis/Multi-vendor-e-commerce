import { Routes } from '@angular/router';
import { BuyerDashboardComponent } from './pages/buyer-dashboard/buyer-dashboard.component';

export const buyer_routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: BuyerDashboardComponent },
];
