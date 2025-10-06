import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'order' | 'product' | 'system' | 'promotion';
  title: string;
  message: string;
  orderId?: string;
  productId?: string;
  timestamp: Date;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadNotifications();
    
    // إضافة إشعارات تجريبية إذا لم تكن موجودة
    setTimeout(() => {
      if (this.notificationsSubject.value.length === 0) {
        this.generateTestNotifications();
      }
    }, 1000);
  }

  private loadNotifications(): void {
    // تحميل الإشعارات المحفوظة
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const notifications = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      } catch (error) {
        console.error('خطأ في تحميل الإشعارات:', error);
      }
    }
  }

  private saveNotifications(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notificationsSubject.value));
    } catch (error) {
      console.error('خطأ في حفظ الإشعارات:', error);
    }
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // إشعار طلب جديد
  notifyNewOrder(orderId: string, customerName: string, total: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'order',
      title: 'طلب جديد',
      message: `طلب جديد #${orderId} من ${customerName} بقيمة ${total} ج.م`,
      orderId,
      timestamp: new Date(),
      isRead: false,
      priority: 'high'
    };

    this.addNotification(notification);
  }

  // إشعار مخزون منخفض
  notifyLowStock(productId: string, productName: string, currentStock: number): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'product',
      title: 'مخزون منخفض',
      message: `المنتج ${productName} مخزونه منخفض (${currentStock} قطعة)`,
      productId,
      timestamp: new Date(),
      isRead: false,
      priority: 'medium'
    };

    this.addNotification(notification);
  }

  // إشعار طلب تم تأكيده
  notifyOrderConfirmed(orderId: string, customerName: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'order',
      title: 'تم تأكيد الطلب',
      message: `تم تأكيد طلب #${orderId} - ${customerName}`,
      orderId,
      timestamp: new Date(),
      isRead: false,
      priority: 'medium'
    };

    this.addNotification(notification);
  }

  // إشعار طلب تم شحنه
  notifyOrderShipped(orderId: string, customerName: string, trackingNumber?: string): void {
    const message = trackingNumber 
      ? `تم شحن طلب #${orderId} - ${customerName} - رقم التتبع: ${trackingNumber}`
      : `تم شحن طلب #${orderId} - ${customerName}`;

    const notification: Notification = {
      id: this.generateId(),
      type: 'order',
      title: 'تم شحن الطلب',
      message,
      orderId,
      timestamp: new Date(),
      isRead: false,
      priority: 'medium'
    };

    this.addNotification(notification);
  }

  // إشعار طلب تم تسليمه
  notifyOrderDelivered(orderId: string, customerName: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'order',
      title: 'تم تسليم الطلب',
      message: `تم تسليم طلب #${orderId} - ${customerName} بنجاح`,
      orderId,
      timestamp: new Date(),
      isRead: false,
      priority: 'low'
    };

    this.addNotification(notification);
  }

  // إشعار طلب تم إلغاؤه
  notifyOrderCancelled(orderId: string, customerName: string, reason?: string): void {
    const message = reason 
      ? `تم إلغاء طلب #${orderId} - ${customerName} - السبب: ${reason}`
      : `تم إلغاء طلب #${orderId} - ${customerName}`;

    const notification: Notification = {
      id: this.generateId(),
      type: 'order',
      title: 'تم إلغاء الطلب',
      message,
      orderId,
      timestamp: new Date(),
      isRead: false,
      priority: 'high'
    };

    this.addNotification(notification);
  }

  // إشعار نظام عام
  notifySystem(message: string, priority: 'low' | 'medium' | 'high' = 'medium'): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'system',
      title: 'إشعار النظام',
      message,
      timestamp: new Date(),
      isRead: false,
      priority
    };

    this.addNotification(notification);
  }

  // إشعار عرض ترويجي
  notifyPromotion(title: string, message: string): void {
    const notification: Notification = {
      id: this.generateId(),
      type: 'promotion',
      title,
      message,
      timestamp: new Date(),
      isRead: false,
      priority: 'medium'
    };

    this.addNotification(notification);
  }

  private addNotification(notification: Notification): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [notification, ...currentNotifications].slice(0, 100); // الاحتفاظ بآخر 100 إشعار
    this.notificationsSubject.next(updatedNotifications);
    this.saveNotifications();
    this.updateUnreadCount();

    // إظهار إشعار في المتصفح (إذا كان مدعوماً)
    this.showBrowserNotification(notification);
  }

  private showBrowserNotification(notification: Notification): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico'
      });
    }
  }

  // طلب إذن الإشعارات
  requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      return Notification.requestPermission().then(permission => {
        return permission === 'granted';
      });
    }
    return Promise.resolve(false);
  }

  // الحصول على جميع الإشعارات
  getNotifications(): Observable<Notification[]> {
    return this.notifications$;
  }

  // الحصول على عدد الإشعارات غير المقروءة
  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  // تحديد إشعار كمقروء
  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value.map(n => 
      n.id === notificationId ? { ...n, isRead: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
    this.updateUnreadCount();
  }

  // تحديد جميع الإشعارات كمقروءة
  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, isRead: true }));
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
    this.updateUnreadCount();
  }

  // حذف إشعار
  deleteNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(notifications);
    this.saveNotifications();
    this.updateUnreadCount();
  }

  // حذف جميع الإشعارات
  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.saveNotifications();
    this.updateUnreadCount();
  }

  // الحصول على إشعارات غير مقروءة
  getUnreadNotifications(): Notification[] {
    return this.notificationsSubject.value.filter(n => !n.isRead);
  }

  // الحصول على إشعارات حسب النوع
  getNotificationsByType(type: Notification['type']): Notification[] {
    return this.notificationsSubject.value.filter(n => n.type === type);
  }

  // الحصول على إشعارات عالية الأولوية
  getHighPriorityNotifications(): Notification[] {
    return this.notificationsSubject.value.filter(n => n.priority === 'high' && !n.isRead);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // محاكاة إشعارات للاختبار
  generateTestNotifications(): void {
    this.notifyNewOrder('1', 'أحمد محمد', 1500);
    this.notifyLowStock('PROD-001', 'منظف الأرضيات', 5);
    this.notifyOrderConfirmed('2', 'فاطمة علي');
    this.notifySystem('تم تحديث النظام بنجاح', 'low');
    this.notifyPromotion('عرض خاص', 'خصم 20% على جميع المنتجات');
  }
} 