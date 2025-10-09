import { Routes } from '@angular/router';

// Simple Auth Guard
const authGuard = () => {
  try {
    // Simple localStorage check without dependency injection
    const hasToken = !!localStorage.getItem('authToken');
    const hasUser = !!localStorage.getItem('adminUser');
    
    console.log('Auth Guard Check:', { hasToken, hasUser });
    
    if (hasToken && hasUser) {
      return true;
    } else {
      console.log('Redirecting to login');
      window.location.href = '/login';
      return false;
    }
  } catch (error) {
    console.error('Auth guard error:', error);
    window.location.href = '/login';
    return false;
  }
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./components/products/products-list/products-list.component').then(m => m.ProductsListComponent)
      },
      {
        path: 'products/add',
        loadComponent: () => import('./components/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./components/products/product-form/product-form.component').then(m => m.ProductFormComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./components/products/product-details/product-details.component').then(m => m.ProductDetailsComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./components/categories/categories-list/categories-list.component').then(m => m.CategoriesListComponent)
      },
      {
        path: 'categories/add',
        loadComponent: () => import('./components/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: 'categories/edit/:id',
        loadComponent: () => import('./components/categories/category-form/category-form.component').then(m => m.CategoryFormComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./components/orders/order-details/order-details.component').then(m => m.OrderDetailsComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./components/orders/orders-list/orders-list.component').then(m => m.OrdersListComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./components/users/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'coupons',
        loadComponent: () => import('./components/coupons/coupons-list/coupons-list.component').then(m => m.CouponsListComponent)
      },
      {
        path: 'coupons/add',
        loadComponent: () => import('./components/coupons/coupon-form/coupon-form.component').then(m => m.CouponFormComponent)
      },
      {
        path: 'coupons/edit/:id',
        loadComponent: () => import('./components/coupons/coupon-form/coupon-form.component').then(m => m.CouponFormComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./components/settings/settings.component').then(m => m.SettingsComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./components/notifications/notifications.component').then(m => m.NotificationsComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
