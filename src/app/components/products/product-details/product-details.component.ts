import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.scss'
})
// Helper methods to add to your product details component

export class ProductDetailsComponent implements OnInit {
  product: any = null;
  isLoading = false;
  error: string = '';
  showDeleteConfirm = false;
  mainImageIndex = 0;
  showImagePopup = false;
  popupImageSrc = '';
  currentImageIndex = 0;
  private imageErrorHandled = new Set<string>(); // Track which images have already had errors handled

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadProduct();
  }

  loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.router.navigate(['/products']);
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.apiService.get(`/products/${productId}`).subscribe({
      next: (response: any) => {
        this.product = response.data || response;
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        this.error = 'فشل في تحميل بيانات المنتج';
        this.isLoading = false;
      }
    });
  }

  getProductImage(): string {
    if (this.product?.images && this.product.images.length > 0) {
      return this.product.images[this.mainImageIndex] || this.product.images[0];
    }
    return '/assets/images/default-product.svg';
  }

  setMainImage(imageUrl: string): void {
    if (this.product?.images) {
      const index = this.product.images.indexOf(imageUrl);
      if (index !== -1) {
        this.mainImageIndex = index;
      }
    }
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target && !this.imageErrorHandled.has(target.src)) {
      // Mark this image as handled to prevent infinite loops
      this.imageErrorHandled.add(target.src);
      
      // Use local fallback image instead of external placeholder
      target.src = '/assets/images/default-product.svg';
      
      // If the fallback also fails, hide the image to prevent further errors
      target.onerror = () => {
        target.style.display = 'none';
      };
    }
  }

  getStatusBadgeClass(isActive: boolean): string {
    const baseClass = 'px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm';
    if (isActive) {
      return `${baseClass} bg-gradient-to-r from-green-500 to-green-600 text-white`;
    } else {
      return `${baseClass} bg-gradient-to-r from-red-500 to-red-600 text-white`;
    }
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'متاح' : 'غير متاح';
  }

  getProductTypeText(productType: string): string {
    const types: { [key: string]: string } = {
      'normal': 'عادي',
      'specialOffer': 'عرض خاص',
      'new': 'جديد',
      'featured': 'مميز'
    };
    return types[productType] || 'عادي';
  }

  getDiscountPercentage(): number {
    if (this.product?.price && this.product?.discount) {
      return Math.round((this.product.discount / this.product.price) * 100);
    }
    return 0;
  }

  getStockPercentage(): number {
    const maxStock = 100; // يمكنك تعديل هذا الرقم حسب احتياجك
    if (this.product?.stock) {
      return Math.min((this.product.stock / maxStock) * 100, 100);
    }
    return 0;
  }

  formatArabicDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        calendar: 'gregory'
      };
      return date.toLocaleDateString('ar-EG', options);
    } catch (error) {
      return 'تاريخ غير صحيح';
    }
  }

  editProduct(): void {
    this.router.navigate(['/products/edit', this.product._id || this.product.id], {
      state: { product: this.product }
    });
  }

  deleteProduct(): void {
    this.showDeleteConfirm = true;
  }

  confirmDelete(): void {
    if (!this.product?.id) return;

    this.isLoading = true;
    
    this.apiService.delete(`/products/${this.product.id}`).subscribe({
      next: (response: any) => {
        console.log('Product deleted successfully:', response);
        this.isLoading = false;
        this.showDeleteConfirm = false;
        
        // إظهار رسالة نجاح
        this.showSuccessMessage('تم حذف المنتج بنجاح');
        
        // الانتقال إلى صفحة المنتجات
        setTimeout(() => {
          this.router.navigate(['/products']);
        }, 1500);
      },
      error: (error: any) => {
        console.error('Error deleting product:', error);
        this.isLoading = false;
        this.showDeleteConfirm = false;
        this.error = 'فشل في حذف المنتج. يرجى المحاولة مرة أخرى.';
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
  }

  showSuccessMessage(message: string): void {
    // يمكنك استخدام مكتبة للإشعارات مثل ngx-toastr
    // أو إنشاء إشعار بسيط
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  // طريقة للتحقق من وجود صور إضافية
  hasAdditionalImages(): boolean {
    return this.product?.images && this.product.images.length > 1;
  }

  // طريقة للحصول على عدد الصور الإضافية
  getAdditionalImagesCount(): number {
    if (this.product?.images) {
      return Math.max(0, this.product.images.length - 1);
    }
    return 0;
  }

  // طريقة لحساب السعر النهائي بعد الخصم
  getFinalPrice(): number {
    if (this.product?.productType === 'specialOffer' && this.product?.discount > 0) {
      return this.product.price - this.product.discount;
    }
    return this.product?.price || 0;
  }

  // طريقة للتحقق من حالة المخزون
  isInStock(): boolean {
    return this.product?.stock > 0;
  }

  // طريقة للحصول على لون شريط المخزون
  getStockBarColor(): string {
    const stock = this.product?.stock || 0;
    if (stock > 50) return 'bg-green-500';
    if (stock > 20) return 'bg-yellow-500';
    if (stock > 0) return 'bg-orange-500';
    return 'bg-red-500';
  }

  // طريقة لتنسيق الأرقام بالفاصلة العربية
  formatNumber(num: number): string {
    return num.toLocaleString('ar-EG');
  }

  // Image Popup Functions
  openImagePopup(imageSrc: string): void {
    this.popupImageSrc = imageSrc;
    this.showImagePopup = true;
    
    // Find the index of the current image
    if (this.product?.images) {
      this.currentImageIndex = this.product.images.findIndex((img: string) => img === imageSrc);
      if (this.currentImageIndex === -1) {
        this.currentImageIndex = 0;
      }
    }
    
    // Prevent body scroll when popup is open
    document.body.style.overflow = 'hidden';
  }

  closeImagePopup(): void {
    this.showImagePopup = false;
    this.popupImageSrc = '';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
  }

  previousImage(): void {
    if (this.product?.images && this.product.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex > 0 
        ? this.currentImageIndex - 1 
        : this.product.images.length - 1;
      this.popupImageSrc = this.product.images[this.currentImageIndex];
    }
  }

  nextImage(): void {
    if (this.product?.images && this.product.images.length > 1) {
      this.currentImageIndex = this.currentImageIndex < this.product.images.length - 1 
        ? this.currentImageIndex + 1 
        : 0;
      this.popupImageSrc = this.product.images[this.currentImageIndex];
    }
  }

  // Handle keyboard navigation for popup
  onKeyDown(event: KeyboardEvent): void {
    if (!this.showImagePopup) return;
    
    switch (event.key) {
      case 'Escape':
        this.closeImagePopup();
        break;
      case 'ArrowLeft':
        this.nextImage();
        break;
      case 'ArrowRight':
        this.previousImage();
        break;
    }
  }
}
