import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CouponsService, Coupon, CouponsResponse } from '../../../services/coupons.service';
import { PaginationComponent, PaginationInfo } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-coupons-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './coupons-list.component.html',
  styleUrl: './coupons-list.component.scss'
})
export class CouponsListComponent implements OnInit {
  coupons: Coupon[] = [];
  apiResponse: CouponsResponse | null = null;
  isLoading = false;
  error: string | null = null;

  // Filters
  filters = {
    search: '',
    status: '',
    discountType: '',
    page: 1,
    limit: 10,
    sort: '-createdAt'
  };

  // Delete confirmation
  showDeleteDialog = false;
  couponToDelete: Coupon | null = null;
  isDeleting = false;

  constructor(
    private couponsService: CouponsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.isLoading = true;
    this.error = null;

    const params = this.buildQueryParams();

    this.couponsService.getCoupons(params).subscribe({
      next: (response: any) => {
        this.apiResponse = response;
        this.coupons = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.error = 'حدث خطأ في تحميل الكوبونات';
        this.coupons = [];
        this.isLoading = false;
      }
    });
  }

  private buildQueryParams(): any {
    const params: any = {
      page: this.filters.page,
      limit: this.filters.limit,
      sort: this.filters.sort
    };

    if (this.filters.search?.trim()) {
      params.search = this.filters.search.trim();
    }

    if (this.filters.status) {
      params.isActive = this.filters.status === 'active';
    }

    if (this.filters.discountType) {
      params.discountType = this.filters.discountType;
    }

    return params;
  }

  applyFilters(): void {
    this.filters.page = 1;
    this.loadCoupons();
  }

  clearFilters(): void {
    this.filters = {
      search: '',
      status: '',
      discountType: '',
      page: 1,
      limit: 10,
      sort: '-createdAt'
    };
    this.loadCoupons();
  }

  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadCoupons();
  }

  onLimitChange(): void {
    this.filters.page = 1;
    this.loadCoupons();
  }

  // Navigation
  navigateToAdd(): void {
    this.router.navigate(['/coupons/add']);
  }

  navigateToEdit(coupon: Coupon): void {
    this.router.navigate(['/coupons/edit', coupon._id]);
  }

  // Edit coupon - fetch details and navigate to form
  editCoupon(coupon: Coupon): void {
    if (!coupon._id) {
      this.error = 'معرف الكوبون غير صحيح';
      return;
    }

    // Get coupon details using the API and navigate to edit form
    this.couponsService.getCoupon(coupon._id).subscribe({
      next: (response: any) => {
        console.log('Coupon details response:', response);
        
        // Extract coupon data from response
        const couponDetails = response.data || response;
        
        // Navigate to edit form with the coupon data
        this.router.navigate(['/coupons/edit', coupon._id], {
          state: { couponData: couponDetails }
        });
      },
      error: (error) => {
        console.error('Error fetching coupon details:', error);
        this.error = 'فشل في جلب تفاصيل الكوبون';
        // Still navigate to edit even if API fails, form will try to load the data
        this.router.navigate(['/coupons/edit', coupon._id]);
      }
    });
  }

  // Delete functionality
  confirmDelete(coupon: Coupon): void {
    this.couponToDelete = coupon;
    this.showDeleteDialog = true;
  }

  onDeleteConfirm(): void {
    if (this.couponToDelete?._id) {
      this.isDeleting = true;
      
      this.couponsService.deleteCoupon(this.couponToDelete._id).subscribe({
        next: (response) => {
          console.log('Coupon deleted successfully:', response);
          // Show success message
          this.showSuccessMessage(`تم حذف الكوبون "${this.couponToDelete?.code}" بنجاح`);
          
          // Reset states
          this.isDeleting = false;
          this.showDeleteDialog = false;
          this.couponToDelete = null;
          
          // Reload coupons list
          this.loadCoupons();
        },
        error: (error) => {
          console.error('Error deleting coupon:', error);
          this.error = 'فشل في حذف الكوبون. يرجى المحاولة مرة أخرى.';
          this.isDeleting = false;
          this.showDeleteDialog = false;
          this.couponToDelete = null;
        }
      });
    }
  }

  onDeleteCancel(): void {
    this.showDeleteDialog = false;
    this.couponToDelete = null;
  }

  // Toggle status
  toggleStatus(coupon: Coupon): void {
    if (coupon._id) {
      const newStatus = !(coupon.isActive === true);
      this.couponsService.toggleCouponStatus(coupon._id, newStatus).subscribe({
        next: (updatedCoupon) => {
          const index = this.coupons.findIndex(c => c._id === coupon._id);
          if (index !== -1) {
            this.coupons[index] = updatedCoupon;
          }
        },
        error: (error) => {
          this.error = 'حدث خطأ في تغيير حالة الكوبون';
        }
      });
    }
  }

  // Helper methods
  getStatusText(isActive?: boolean): string {
    return isActive === true ? 'نشط' : 'غير نشط';
  }

  getStatusColor(isActive?: boolean): string {
    return isActive === true ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }

  getDiscountTypeText(type?: string, discount?: number): string {
    // If type is not provided, guess based on discount value
    if (!type && discount !== undefined) {
      return discount <= 100 ? 'نسبة مئوية' : 'مبلغ ثابت';
    }
    return type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت';
  }

  formatDiscount(coupon: Coupon): string {
    console.log('Formatting discount:', { 
      discount: coupon.discount, 
      discountType: coupon.discountType,
      code: coupon.code 
    });
    
    // Check if discountType exists, if not, assume percentage for values <= 100
    if (coupon.discountType === 'percentage' || 
        (!coupon.discountType && coupon.discount <= 100)) {
      return `${coupon.discount}%`;
    } else {
      return `${coupon.discount} جنيه`;
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-EG');
  }

  isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.search || this.filters.status || this.filters.discountType);
  }

  trackByCouponId(index: number, coupon: Coupon): string {
    return coupon._id || index.toString();
  }

  getTotalUsageCount(): number {
    return this.coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);
  }

  getActiveCouponsCount(): number {
    return this.coupons.filter(c => c.isActive === true).length;
  }

  getExpiredCouponsCount(): number {
    return this.coupons.filter(c => this.isExpired(c.expiresAt)).length;
  }

  getPaginationInfo(): PaginationInfo | null {
    if (!this.apiResponse) return null;
    
    return {
      current: this.apiResponse.page,
      pages: this.apiResponse.totalPages,
      total: this.apiResponse.total,
      limit: this.filters.limit
    };
  }

  getUsagePercentage(coupon: Coupon): number {
    if (!coupon.usageLimit || coupon.usageLimit === 0) return 0;
    const used = coupon.usedCount || 0;
    return Math.min((used / coupon.usageLimit) * 100, 100);
  }

  showSuccessMessage(message: string): void {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}
