import { Routes } from '@angular/router';
import {
  HomeComponent,
  AboutComponent,
  ContactComponent,
  LoginComponent,
  RegisterComponent,
  CheckoutComponent,
  ShopComponent,
} from './pages';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { roleGuard } from './core/guards/role.guard';
import { authGuard } from './core/guards/auth.guard';
import { loggedGuard } from './core/guards/logged.guard';

export const routes: Routes = [
  // public routes
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'shop', component: ShopComponent },

  // protected routes
  {
    path: 'users/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile.component').then(
        (C) => C.ProfileComponent
      ),
  },

  {
    path: 'auth',
    canActivate: [loggedGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'admin/admin-login',
        loadComponent: () =>
          import(
            './features/admin/pages/admin-login/admin-login.component'
          ).then((C) => C.AdminLoginComponent),
      },
    ],
  },
  {
    path: 'admin',
    data: {
      requiredRole: 'admin',
    },
    canActivate: [authGuard, roleGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((R) => R.admin_routes),
  },
  {
    path: 'seller',
    data: {
      requiredRole: 'seller',
    },
    canActivate: [authGuard, roleGuard],
    loadChildren: () =>
      import('./features/seller/seller.routes').then((R) => R.seller_routes),
  },
  {
    path: 'buyer',
    data: {
      requiredRole: 'buyer',
    },
    canActivate: [authGuard, roleGuard],
    loadChildren: () =>
      import('./features/buyer/buyer.routes').then((R) => R.buyer_routes),
  },

  //   wild card
  { path: '**', component: NotFoundComponent },
];
