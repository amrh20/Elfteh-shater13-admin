import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  unreadCount = 0;
  
  // Filters
  selectedType = '';
  selectedStatus = '';
  selectedPriority = '';
  selectedDateRange = '';

  private notificationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.notificationsSubscription = this.notificationService.getNotifications().subscribe(notifications => {
      this.notifications = notifications;
      this.applyFilters();
    });

    this.unreadCountSubscription = this.notificationService.getUnreadCount().subscribe(count => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }

  applyFilters(): void {
    let filtered = [...this.notifications];

    // Filter by type
    if (this.selectedType) {
      filtered = filtered.filter(n => n.type === this.selectedType);
    }

    // Filter by status
    if (this.selectedStatus === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    } else if (this.selectedStatus === 'read') {
      filtered = filtered.filter(n => n.isRead);
    }

    // Filter by priority
    if (this.selectedPriority) {
      filtered = filtered.filter(n => n.priority === this.selectedPriority);
    }

    // Filter by date range
    if (this.selectedDateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (this.selectedDateRange) {
        case 'today':
          filtered = filtered.filter(n => n.timestamp >= today);
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(n => n.timestamp >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(n => n.timestamp >= monthAgo);
          break;
      }
    }

    this.filteredNotifications = filtered;
  }

  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(notificationId: string): void {
    this.notificationService.deleteNotification(notificationId);
  }

  clearAllNotifications(): void {
    if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      this.notificationService.clearAllNotifications();
    }
  }

  handleNotificationAction(notification: Notification): void {
    // Mark as read first
    this.notificationService.markAsRead(notification.id);

    // Navigate based on notification type
    if (notification.type === 'order' && notification.orderId) {
      this.router.navigate(['/orders', notification.orderId]);
    } else if (notification.type === 'product' && notification.productId) {
      this.router.navigate(['/products', notification.productId]);
    }
  }

  generateTestNotifications(): void {
    this.notificationService.generateTestNotifications();
  }

  getNotificationIconClass(type: string): string {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600';
      case 'product':
        return 'bg-green-100 text-green-600';
      case 'system':
        return 'bg-purple-100 text-purple-600';
      case 'promotion':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getPriorityBadgeClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getPriorityText(priority: string): string {
    switch (priority) {
      case 'high':
        return 'عالية';
      case 'medium':
        return 'متوسطة';
      case 'low':
        return 'منخفضة';
      default:
        return priority;
    }
  }

  getFormattedDate(timestamp: Date): string {
    return timestamp.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'الآن';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `منذ ${minutes} دقيقة`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ساعة`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} يوم`;
    } else {
      return timestamp.toLocaleDateString('ar-EG');
    }
  }
}