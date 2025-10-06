import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdersService } from '../../../services/orders.service';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit {
  orderId = '';
  order: any = null;
  isLoading = true;
  error: string | null = null;

  // Modal states
  showStatusModal = false;
  showPaymentModal = false;
  showPrintModal = false;
  newOrderStatus = '';
  newPaymentStatus = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService
  ) {}

  ngOnInit(): void {
    this.orderId = this.route.snapshot.paramMap.get('id') || '';
    if (this.orderId) {
      this.loadOrderDetails();
    } else {
      this.error = 'معرف الطلب غير صحيح';
      this.isLoading = false;
    }
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.error = null;
    
    this.ordersService.getOrder(this.orderId).subscribe({
      next: (response: any) => {
        if (response) {
          this.order = this.mapAPIOrderToDisplay(response);
        } else {
          this.error = 'لم يتم العثور على بيانات الطلب';
        }
        
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'حدث خطأ أثناء تحميل تفاصيل الطلب';
        this.isLoading = false;
      }
    });
  }

  /**
   * Map API order data to display format
   */
  mapAPIOrderToDisplay(apiOrder: any): any {
    console.log('🔍 Order Details - API Order Data:', apiOrder);
    console.log('📦 Delivery Fee from API:', apiOrder.deliveryFee);
    console.log('💰 Subtotal from API:', apiOrder.subtotal);
    console.log('💳 Total Amount from API:', apiOrder.totalAmount);
    
    const mappedOrder = {
      id: apiOrder._id || apiOrder.orderNumber || 'غير محدد',
      orderNumber: apiOrder.orderNumber || 'غير محدد',
      userName: apiOrder.customerInfo?.name || 'غير محدد',
      userEmail: apiOrder.customerInfo?.email || 'غير محدد',
      userPhone: apiOrder.customerInfo?.phone || 'غير محدد',
      totalAmount: apiOrder.totalAmount || 0,
      subtotal: apiOrder.subtotal || this.calculateSubtotal(apiOrder.items),
      deliveryFee: apiOrder.deliveryFee || 0,
      shipping: apiOrder.deliveryFee || 0,
      status: apiOrder.status || 'pending',
      paymentStatus: this.getPaymentStatusFromOrder(apiOrder),
      paymentMethod: 'بطاقة ائتمان', // Default value
      createdAt: new Date(apiOrder.createdAt || Date.now()),
      updatedAt: new Date(apiOrder.updatedAt || Date.now()),
      shippingAddress: {
        name: apiOrder.customerInfo?.name || 'غير محدد',
        address: apiOrder.customerInfo?.address?.street || 'غير محدد',
        city: apiOrder.customerInfo?.address?.city || 'غير محدد',
        postalCode: 'غير محدد',
        phone: apiOrder.customerInfo?.phone || 'غير محدد'
      },
      items: this.mapOrderItems(apiOrder.items || []),
      notes: apiOrder.notes || 'لا توجد ملاحظات',
      statusHistory: this.createStatusHistory(apiOrder),
      // Keep original API data for reference
      originalData: apiOrder
    };
    
    console.log('✅ Order Details - Mapped Order:', mappedOrder);
    console.log('🚚 Mapped Delivery Fee:', mappedOrder.deliveryFee);
    
    return mappedOrder;
  }

  /**
   * Calculate subtotal from order items
   */
  calculateSubtotal(items: any[]): number {
    return items.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      return total + itemTotal;
    }, 0);
  }

  /**
   * Map order items from API format
   */
  mapOrderItems(apiItems: any[]): any[] {
    return apiItems.map((item, index) => ({
      id: item.product?._id || `item-${index}`,
      name: item.product?.name || 'منتج غير محدد',
      nameAr: item.product?.name || 'منتج غير محدد',
      price: item.price || 0,
      quantity: item.quantity || 1,
      total: (item.price || 0) * (item.quantity || 1),
      image: '/assets/images/default-product.svg'
    }));
  }

  /**
   * Create status history from order data
   */
  createStatusHistory(apiOrder: any): any[] {
    const history = [
      {
        status: apiOrder.status || 'pending',
        date: new Date(apiOrder.createdAt || Date.now()),
        note: 'تم إنشاء الطلب'
      }
    ];

    if (apiOrder.updatedAt && apiOrder.updatedAt !== apiOrder.createdAt) {
      history.push({
        status: apiOrder.status || 'pending',
        date: new Date(apiOrder.updatedAt),
        note: 'تم تحديث الطلب'
      });
    }

    return history;
  }

  /**
   * Determine payment status from order data
   */
  getPaymentStatusFromOrder(order: any): string {
    // You can implement logic here based on your API response structure
    // For now, defaulting to pending
    return 'pending';
  }

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

  updateOrderStatus(): void {
    this.newOrderStatus = this.order.status; // Set current status as default
    this.showStatusModal = true;
  }

  updatePaymentStatus(): void {
    this.newPaymentStatus = this.order.paymentStatus; // Set current payment status as default
    this.showPaymentModal = true;
  }

  cancelStatusUpdate(): void {
    this.showStatusModal = false;
    this.newOrderStatus = '';
  }

  cancelPaymentUpdate(): void {
    this.showPaymentModal = false;
    this.newPaymentStatus = '';
  }

  confirmStatusUpdate(): void {
    if (this.newOrderStatus) {
      // Show loading state
      this.isLoading = true;
      
      // Call API to update order status
      this.ordersService.updateOrderStatus(this.orderId, this.newOrderStatus).subscribe({
        next: (success: boolean) => {
          if (success) {
            // Update local data
            this.order.status = this.newOrderStatus;
            
            // Add to status history
            this.order.statusHistory.push({
              status: this.newOrderStatus,
              date: new Date(),
              note: `تم تحديث الحالة إلى: ${this.getStatusText(this.newOrderStatus)}`
            });
            
            // Show success message
            alert(`تم تحديث حالة الطلب #${this.orderId} إلى: ${this.getStatusText(this.newOrderStatus)}`);
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
      this.ordersService.updatePaymentStatus(this.orderId, this.newPaymentStatus).subscribe({
        next: (success: boolean) => {
          if (success) {
            // Update local data
            this.order.paymentStatus = this.newPaymentStatus;
            
            // Show success message
            alert(`تم تحديث حالة الدفع #${this.orderId} إلى: ${this.getPaymentStatusText(this.newPaymentStatus)}`);
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

  showPrintPreview(): void {
    this.showPrintModal = true;
  }

  closePrintModal(): void {
    this.showPrintModal = false;
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  printOrder(): void {
    window.print();
    this.closePrintModal();
  }
} 