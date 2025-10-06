import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../../services/dashboard.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  currentUser: any = null;

  // إحصائيات متقدمة
  stats = {
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCategories: 0,
    totalCoupons: 0,
    totalUsers: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    monthlyGrowth: 0
  };

  // بيانات المنتجات
  recentProducts: any[] = [];
  featuredProducts: any[] = [];
  lowStockProducts: any[] = [];
  topSellingProducts: any[] = [];
  slowMovingProducts: any[] = [];
  productsForPromotion: any[] = [];

  // بيانات الأصناف
  categories: any[] = [];
  topCategories: any[] = [];

  // بيانات الطلبات
  recentOrders: any[] = [];
  orderStatusCounts: any = {};

  // إجراءات سريعة
  quickActions = [
    {
      title: 'إضافة منتج جديد',
      description: 'إضافة منتج جديد للمتجر',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      route: '/products/add',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'إضافة صنف جديد',
      description: 'إنشاء تصنيف جديد للمنتجات',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      route: '/categories/add',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'عرض الطلبات',
      description: 'إدارة طلبات العملاء',
      icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
      route: '/orders',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'إدارة المستخدمين',
      description: 'إدارة حسابات المستخدمين',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      route: '/users',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user loaded:', this.currentUser);
  }

  loadDashboardData(): void {
    this.isLoading = true;
    
    console.log('🔄 بدء تحميل بيانات Dashboard...');

    this.dashboardService.getDashboardStats().subscribe({
      next: (dashboardData) => {
        console.log('✅ تم تحميل بيانات Dashboard:', dashboardData);
        
        // تحديث الإحصائيات
        this.stats = {
          ...this.stats,
          ...dashboardData.stats
        };

        // تحديث البيانات الأخرى
        this.recentProducts = dashboardData.products.slice(0, 5);
        this.categories = dashboardData.categories.slice(0, 5);
        this.recentOrders = dashboardData.orders.slice(0, 5);
        this.featuredProducts = dashboardData.products.filter((p: any) => p.featured === true).slice(0, 4);
        this.lowStockProducts = dashboardData.products.filter((p: any) => (p.stock || 0) < 10).slice(0, 5);

        console.log('📊 الإحصائيات النهائية:', this.stats);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ خطأ في تحميل بيانات Dashboard:', error);
        
        // استخدام البيانات التجريبية في حالة الخطأ
        // this.stats = {
        //   totalProducts: 20,
        //   totalCategories: 4,
        //   totalOrders: 156,
        //   totalRevenue: 45600,
        //   totalCoupons: 8,
        //   totalUsers: 12,
        //   activeProducts: 18,
        //   lowStockProducts: 3,
        //   pendingOrders: 23,
        //   deliveredOrders: 98,
        //   monthlyGrowth: 12.5
        // };
        
        this.isLoading = false;
      }
    });
  }


  // إجراءات سريعة
  navigateToAction(route: string): void {
    this.router.navigate([route]);
  }

  // دوال مساعدة
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'pending': 'في الانتظار',
      'confirmed': 'مؤكد',
      'processing': 'قيد المعالجة',
      'shipped': 'تم الشحن',
      'delivered': 'تم التوصيل',
      'cancelled': 'ملغي'
    };
    return texts[status] || status;
  }

  getCategoryNameAr(category: any): string {
    if (typeof category === 'string') {
      const categoryNames: { [key: string]: string } = {
        'Cleaners': 'منظفات',
        'Household Tools': 'أدوات منزلية',
        'Electronics': 'إلكترونيات',
        'Clothing': 'ملابس',
        'Books': 'كتب',
        'Home & Garden': 'المنزل والحديقة',
        'Sports': 'رياضة'
      };
      return categoryNames[category] || category;
    }
    return category?.nameAr || category?.name || 'غير محدد';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount);
  }

  getStockStatus(stock: number): { color: string; text: string } {
    if (stock === 0) return { color: 'text-red-600', text: 'نفذ المخزون' };
    if (stock < 10) return { color: 'text-orange-600', text: 'مخزون منخفض' };
    if (stock < 50) return { color: 'text-yellow-600', text: 'مخزون متوسط' };
    return { color: 'text-green-600', text: 'مخزون جيد' };
  }

  getProductImage(product: any): string {
    if (product?.images && product.images.length > 0) {
      return product.images[0];
    }
    return '/assets/images/default-product.svg';
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = '/assets/images/default-product.svg';
    }
  }
}
