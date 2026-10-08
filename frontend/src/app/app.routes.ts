import { Routes } from '@angular/router';

import { adminGuard } from './guards/admin-guard';
import { authGuard } from './guards/auth-guard';
import { customerGuard } from './guards/customer-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    title: 'VoltEdge — Electronics Store',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'category/:category',
    title: 'Shop — VoltEdge',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'search',
    title: 'Search — VoltEdge',
    loadComponent: () =>
      import('./pages/product-list/product-list').then((m) => m.ProductList),
  },
  {
    path: 'product/:id',
    title: 'Product — VoltEdge',
    loadComponent: () =>
      import('./pages/product-details/product-details').then((m) => m.ProductDetails),
  },
  {
    path: 'signin',
    title: 'Sign in — VoltEdge',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/signin/signin').then((m) => m.Signin),
  },
  {
    path: 'signup',
    title: 'Create account — VoltEdge',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/signup/signup').then((m) => m.Signup),
  },
  {
    path: 'cart',
    title: 'Your cart — VoltEdge',
    canActivate: [customerGuard],
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'favourites',
    title: 'Favourites — VoltEdge',
    canActivate: [customerGuard],
    loadComponent: () =>
      import('./pages/favourites/favourites').then((m) => m.Favourites),
  },
  {
    path: 'checkout',
    title: 'Checkout — VoltEdge',
    canActivate: [customerGuard],
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'orders',
    title: 'Your orders — VoltEdge',
    canActivate: [customerGuard],
    loadComponent: () => import('./pages/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'account',
    title: 'Your account — VoltEdge',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/account/account').then((m) => m.Account),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin/admin').then((m) => m.Admin),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard — VoltEdge Admin',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard/admin-dashboard').then(
            (m) => m.AdminDashboard
          ),
      },
      {
        path: 'products',
        title: 'Products — VoltEdge Admin',
        loadComponent: () =>
          import('./pages/admin/admin-products/admin-products').then(
            (m) => m.AdminProducts
          ),
      },
      {
        path: 'products/new',
        title: 'Add product — VoltEdge Admin',
        loadComponent: () =>
          import('./pages/admin/admin-product-form/admin-product-form').then(
            (m) => m.AdminProductForm
          ),
      },
      {
        path: 'products/:id/edit',
        title: 'Edit product — VoltEdge Admin',
        loadComponent: () =>
          import('./pages/admin/admin-product-form/admin-product-form').then(
            (m) => m.AdminProductForm
          ),
      },
      {
        path: 'orders',
        title: 'Orders — VoltEdge Admin',
        loadComponent: () =>
          import('./pages/admin/admin-orders/admin-orders').then((m) => m.AdminOrders),
      },
    ],
  },
  {
    path: '**',
    title: 'Page not found — VoltEdge',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
