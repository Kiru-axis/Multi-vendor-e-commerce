import { Routes } from '@angular/router';

import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

export const admin_routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: AdminDashboardComponent },
];
