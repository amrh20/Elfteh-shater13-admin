import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';
import { PaginationComponent } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.scss'
})
export class OrdersListComponent implements OnInit {
  // API filters based on documentation
  apiFilters = {
    page: 1,
    limit: 20,
    status: '',
    search: '',
    startDate: '',
    endDate: '',
    sort: '-createdAt'
  };
  
  // API response data
  apiResponse: any = null;
  isLoading = false;
  
  constructor(
    private router: Router,
    private ordersService: OrdersService
  ) {}
  
  // Modal states
  showStatusModal = false;
  showPaymentModal = false;
  selectedOrderId = '';
  newOrderStatus = '';
  newPaymentStatus = '';

  // Filter states - Remove old filter variables
  filteredOrders: any[] = [];

  ngOnInit(): void {
    // Load orders with API filters
    this.loadOrdersWithAPI();
  }

  loadOrders(): void {
    this.ordersService.getOrders().subscribe({
      next: (orders: any[]) => {
        this.filteredOrders = orders;
      },
      error: (error: any) => {
        this.filteredOrders = [];
      }
    });
  }

  /**
   * Load orders with API filters
   */
  loadOrdersWithAPI(): void {
    this.isLoading = true;
    
    this.ordersService.getOrdersWithFilters(this.apiFilters).subscribe({
      next: (response: any) => {
        this.apiResponse = response;
        
        // Update filtered orders with API data
        // Handle different possible response structures
        let ordersData: any[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          ordersData = response.data;
        } else if (response.orders && Array.isArray(response.orders)) {
          ordersData = response.orders;
        } else if (Array.isArray(response)) {
          ordersData = response;
        } else if (response.results && Array.isArray(response.results)) {
          ordersData = response.results;
        }
        
        if (ordersData.length > 0) {
          console.log('Raw API Order Data:', ordersData[0]); // Debug first order
          this.filteredOrders = ordersData.map((order: any) => this.mapAPIOrderToDisplay(order));
          console.log('Mapped Order Data:', this.filteredOrders[0]); // Debug mapped order
        } else {
          this.filteredOrders = [];
        }
        
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        // Fallback to mock data on error
        this.filteredOrders = [];
      }
    });
  }

  /**
   * Map API order to display format
   */
  mapAPIOrderToDisplay(apiOrder: any): any {
    return {
      id: apiOrder._id || apiOrder.id,
      orderNumber: apiOrder.orderNumber || apiOrder._id || apiOrder.id,
      userName: apiOrder.customerInfo?.name || apiOrder.userName || apiOrder.user?.name || apiOrder.customerName || 'غير محدد',
      userEmail: apiOrder.customerInfo?.email || apiOrder.userEmail || apiOrder.user?.email || apiOrder.customerEmail || 'غير محدد',
      totalAmount: apiOrder.totalAmount || apiOrder.amount || 0,
      subtotal: apiOrder.subtotal || 0,
      deliveryFee: apiOrder.deliveryFee || 0,
      status: apiOrder.status || 'pending',
      paymentStatus: apiOrder.paymentStatus || 'pending',
      createdAt: apiOrder.createdAt || new Date(),
      notes: apiOrder.notes || '',
      items: apiOrder.items || [],
      customerPhone: apiOrder.customerInfo?.phone || apiOrder.customerPhone || apiOrder.user?.phone || '',
      customerInfo: apiOrder.customerInfo || null, // Add customerInfo object
      key: apiOrder.key || '', // Add key field if available
      originalData: apiOrder // Keep original data for debugging
    };
  }

  /**
   * Determine payment status from order data
   */
  getPaymentStatusFromOrder(order: any): string {
    // You can implement logic here based on your API response structure
    // For now, defaulting to pending
    return 'pending';
  }

  /**
   * Manually refresh API data
   */
  refreshAPIData(): void {
    this.loadOrdersWithAPI();
  }

  /**
   * Get count for specific status from API stats
   */
  getStatusCount(status: string): number {
    if (this.apiResponse?.stats && Array.isArray(this.apiResponse.stats)) {
      const statusStat = this.apiResponse.stats.find((stat: any) => stat._id === status);
      return statusStat ? statusStat.count : 0;
    }
    return 0;
  }

  /**
   * Get total amount for specific status from API stats
   */
  getStatusAmount(status: string): number {
    if (this.apiResponse?.stats && Array.isArray(this.apiResponse.stats)) {
      const statusStat = this.apiResponse.stats.find((stat: any) => stat._id === status);
      return statusStat ? statusStat.totalAmount : 0;
    }
    return 0;
  }

  /**
   * Get pending orders count (for backward compatibility)
   */
  getPendingOrdersCount(): number {
    return this.getStatusCount('pending');
  }

  /**
   * Get total amount (for backward compatibility)
   */
  getTotalAmount(): number {
    if (this.apiResponse?.stats && Array.isArray(this.apiResponse.stats)) {
      return this.apiResponse.stats.reduce((total: number, stat: any) => total + (stat.totalAmount || 0), 0);
    }
    return 0;
  }

  /**
   * Get pagination info for pagination component
   */
  getPaginationInfo(): any {
    if (this.apiResponse?.pagination) {
      return {
        current: this.apiResponse.pagination.current || 1,
        pages: this.apiResponse.pagination.pages || 1,
        total: this.apiResponse.pagination.total || 0,
        limit: this.apiResponse.pagination.limit || 20
      };
    }
    return null;
  }

  /**
   * Handle page change from pagination component
   */
  onPageChange(page: number): void {
    this.apiFilters.page = page;
    this.loadOrdersWithAPI();
  }

  /**
   * Get last update time for current data
   */
  getLastUpdateTime(): string {
    return new Date().toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  /**
   * Handle search input changes
   */
  onSearchChange(): void {
    // Reset to first page when searching
    this.apiFilters.page = 1;
    // Apply search immediately
    this.applyFilters();
  }

  /**
   * Handle filter changes
   */
  onFilterChange(): void {
    // Reset to first page when filters change
    this.apiFilters.page = 1;
    // Apply filters immediately
    this.applyFilters();
  }

  /**
   * Apply all current filters and search
   */
  applyFilters(): void {
    // Reset to first page when applying filters
    this.apiFilters.page = 1;
    // Load orders with current filters
    this.loadOrdersWithAPI();
  }

  /**
   * Clear all filters and search
   */
  clearFilters(): void {
    this.apiFilters = {
      page: 1,
      limit: 20,
      status: '',
      search: '',
      startDate: '',
      endDate: '',
      sort: '-createdAt'
    };
    this.filteredOrders = []; // Clear filtered orders when clearing filters
    this.loadOrdersWithAPI();
  }

  /**
   * Check if there are active filters
   */
  hasActiveFilters(): boolean {
    return !!(this.apiFilters.search ||
      this.apiFilters.status ||
      this.apiFilters.startDate ||
      this.apiFilters.endDate ||
      this.apiFilters.sort !== '-createdAt' ||
      this.apiFilters.limit !== 20);
  }

  /**
   * Get active filters for display
   */
  getActiveFilters(): any[] {
    const activeFilters: any[] = [];
    
    if (this.apiFilters.search) {
      activeFilters.push({
        key: 'search',
        label: 'البحث',
        value: this.apiFilters.search
      });
    }
    
    if (this.apiFilters.status) {
      activeFilters.push({
        key: 'status',
        label: 'حالة الطلب',
        value: this.getStatusText(this.apiFilters.status)
      });
    }
    
    if (this.apiFilters.startDate) {
      activeFilters.push({
        key: 'startDate',
        label: 'تاريخ البداية',
        value: new Date(this.apiFilters.startDate).toLocaleDateString('ar-EG')
      });
    }
    
    if (this.apiFilters.endDate) {
      activeFilters.push({
        key: 'endDate',
        label: 'تاريخ النهاية',
        value: new Date(this.apiFilters.endDate).toLocaleDateString('ar-EG')
      });
    }
    
    if (this.apiFilters.sort !== '-createdAt') {
      const sortLabels: any = {
        'createdAt': 'الأقدم أولاً',
        '-totalAmount': 'الأعلى سعراً',
        'totalAmount': 'الأقل سعراً',
        '-orderNumber': 'رقم الطلب (تنازلي)',
        'orderNumber': 'رقم الطلب (تصاعدي)'
      };
      activeFilters.push({
        key: 'sort',
        label: 'الترتيب',
        value: sortLabels[this.apiFilters.sort] || this.apiFilters.sort
      });
    }
    
    if (this.apiFilters.limit !== 20) {
      activeFilters.push({
        key: 'limit',
        label: 'عدد العناصر',
        value: this.apiFilters.limit
      });
    }
    
    return activeFilters;
  }

  /**
   * Remove a specific filter
   */
  removeFilter(filterKey: string): void {
    switch (filterKey) {
      case 'search':
        this.apiFilters.search = '';
        break;
      case 'status':
        this.apiFilters.status = '';
        break;
      case 'startDate':
        this.apiFilters.startDate = '';
        break;
      case 'endDate':
        this.apiFilters.endDate = '';
        break;
      case 'sort':
        this.apiFilters.sort = '-createdAt';
        break;
      case 'limit':
        this.apiFilters.limit = 20;
        break;
    }
    
    // Reset to first page and reload
    this.apiFilters.page = 1;
    this.loadOrdersWithAPI();
  }

  /**
   * Export filtered data
   */
  exportFilteredData(): void {
    
    if (!this.filteredOrders.length) {
      alert('لا توجد بيانات للتصدير');
      return;
    }
    
    // Create CSV content
    const headers = ['رقم الطلب', 'اسم العميل', 'البريد الإلكتروني', 'المبلغ', 'الحالة', 'تاريخ الطلب'];
    const csvContent = [
      headers.join(','),
      ...this.filteredOrders.map(order => [
        order.id,
        order.userName,
        order.userEmail,
        order.totalAmount,
        this.getStatusText(order.status),
        new Date(order.createdAt).toLocaleDateString('ar-EG')
      ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`تم تصدير ${this.filteredOrders.length} طلب بنجاح`);
  }

  /**
   * Filter orders based on current filters (for local filtering if needed)
   */
  filterOrders(): void {
    this.filteredOrders = this.filteredOrders.filter(order => {
      const matchesSearch = !this.apiFilters.search || 
        order.userName.toLowerCase().includes(this.apiFilters.search.toLowerCase()) ||
        order.userEmail.toLowerCase().includes(this.apiFilters.search.toLowerCase()) ||
        order.id.includes(this.apiFilters.search) ||
        order.orderNumber.includes(this.apiFilters.search) ||
        (order.key && order.key.toLowerCase().includes(this.apiFilters.search.toLowerCase()));
      
      const matchesStatus = !this.apiFilters.status || order.status === this.apiFilters.status;
      
      return matchesSearch && matchesStatus;
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'processing': 'bg-orange-100 text-orange-800',
      'shipped': 'bg-purple-100 text-purple-800',
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

  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'paid': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentStatusText(status: string): string {
    const texts: { [key: string]: string } = {
      'pending': 'في الانتظار',
      'paid': 'مدفوع',
      'failed': 'فشل',
      'refunded': 'مسترد'
    };
    return texts[status] || status;
  }

  // Modal functions
  viewOrderDetails(orderId: string): void {
    // Navigate to order details page
    console.log("orderId",orderId)
    this.router.navigate(['/orders', orderId]);
  }

  updateOrderStatus(orderId: string): void {
    // Find the order to get current status
    const order = this.filteredOrders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrderId = orderId;
      this.newOrderStatus = order.status; // Set current status as default
      this.showStatusModal = true;
    }
  }

  updatePaymentStatus(orderId: string): void {
    // Find the order to get current payment status
    const order = this.filteredOrders.find(o => o.id === orderId);
    if (order) {
      this.selectedOrderId = orderId;
      this.newPaymentStatus = order.paymentStatus; // Set current payment status as default
      this.showPaymentModal = true;
    }
  }

  cancelStatusUpdate(): void {
    this.showStatusModal = false;
    this.selectedOrderId = '';
    this.newOrderStatus = '';
  }

  cancelPaymentUpdate(): void {
    this.showPaymentModal = false;
    this.selectedOrderId = '';
    this.newPaymentStatus = '';
  }

  confirmStatusUpdate(): void {
    if (this.newOrderStatus) {
      // Show loading state
      this.isLoading = true;
      
      // Call API to update order status
      this.ordersService.updateOrderStatus(this.selectedOrderId, this.newOrderStatus).subscribe({
        next: (success: boolean) => {
          if (success) {
            // Update local data
            const order = this.filteredOrders.find(o => o.id === this.selectedOrderId);
            if (order) {
              order.status = this.newOrderStatus;
            }
            
            // Show success message
            alert(`تم تحديث حالة الطلب #${this.selectedOrderId} إلى: ${this.getStatusText(this.newOrderStatus)}`);
            
            // Refresh data from API
            this.loadOrdersWithAPI();
          } else {
            alert('فشل في تحديث حالة الطلب. يرجى المحاولة مرة أخرى.');
          }
        },
        error: (error: any) => {
          console.error('Error updating order status:', error);
          alert('حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة مرة أخرى.');
        },
        complete: () => {
          this.isLoading = false;
          this.cancelStatusUpdate();
        }
      });
    }
  }

  confirmPaymentUpdate(): void {
    if (this.newPaymentStatus) {
      // Show loading state
      this.isLoading = true;
      
      // Call API to update payment status
      this.ordersService.updatePaymentStatus(this.selectedOrderId, this.newPaymentStatus).subscribe({
        next: (success: boolean) => {
          if (success) {
            // Update local data
            const order = this.filteredOrders.find(o => o.id === this.selectedOrderId);
            if (order) {
              order.paymentStatus = this.newPaymentStatus;
            }
            
            // Show success message
            alert(`تم تحديث حالة الدفع #${this.selectedOrderId} إلى: ${this.getPaymentStatusText(this.newPaymentStatus)}`);
            
            // Refresh data from API
            this.loadOrdersWithAPI();
          } else {
            alert('فشل في تحديث حالة الدفع. يرجى المحاولة مرة أخرى.');
          }
        },
        error: (error: any) => {
          console.error('Error updating payment status:', error);
          alert('حدث خطأ أثناء تحديث حالة الدفع. يرجى المحاولة مرة أخرى.');
        },
        complete: () => {
          this.isLoading = false;
          this.cancelPaymentUpdate();
        }
      });
    }
  }

  createTestOrder(): void {
    // This method is removed as OrdersService doesn't have createOrder method
    alert('هذه الميزة غير متاحة حالياً');
  }

  /**
   * Test API filters functionality
   */
  testAPIFilters(): void {
    console.log('Testing API filters...');
    
    // Test 1: Basic search
    this.apiFilters.search = 'أحمد';
    this.apiFilters.status = '';
    this.apiFilters.page = 1;
    this.loadOrdersWithAPI();
    
    // Test 2: Status filter
    setTimeout(() => {
      this.apiFilters.search = '';
      this.apiFilters.status = 'pending';
      this.apiFilters.page = 1;
      this.loadOrdersWithAPI();
    }, 2000);
    
    // Test 3: Pagination
    setTimeout(() => {
      this.apiFilters.search = '';
      this.apiFilters.status = '';
      this.apiFilters.page = 2;
      this.apiFilters.limit = 10;
      this.loadOrdersWithAPI();
    }, 4000);
    
    // Test 4: Date range
    setTimeout(() => {
      this.apiFilters.search = '';
      this.apiFilters.status = '';
      this.apiFilters.page = 1;
      this.apiFilters.limit = 20;
      this.apiFilters.startDate = '2024-01-01';
      this.apiFilters.endDate = '2024-03-31';
      this.loadOrdersWithAPI();
    }, 6000);
    
    // Test 5: Sort
    setTimeout(() => {
      this.apiFilters.search = '';
      this.apiFilters.status = '';
      this.apiFilters.page = 1;
      this.apiFilters.limit = 20;
      this.apiFilters.startDate = '';
      this.apiFilters.endDate = '';
      this.apiFilters.sort = 'createdAt';
      this.loadOrdersWithAPI();
    }, 8000);
    
    // Reset to defaults
    setTimeout(() => {
      this.apiFilters = {
        page: 1,
        limit: 20,
        status: '',
        search: '',
        startDate: '',
        endDate: '',
        sort: '-createdAt'
      };
      this.loadOrdersWithAPI();
    }, 10000);
  }

  /**
   * Debug current API filters and response
   */
  debugAPIFilters(): void {
    console.log('Current API Filters:', this.apiFilters);
    console.log('API Response:', this.apiResponse);
    console.log('Filtered Orders:', this.filteredOrders);
  }
}
