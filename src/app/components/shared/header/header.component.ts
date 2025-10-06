import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, AdminUser } from '../../../services/auth.service';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'product' | 'system' | 'promotion';
  timestamp: Date;
  isRead: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  showNotifications = false;
  unreadCount = 3;
  showLogoutDialog = false;
  currentUser: AdminUser | null = null;
  isMenuToggling = false;
  isMobileMenuOpen = false;
  
  recentNotifications: Notification[] = [
    {
      id: '1',
      title: 'طلب جديد',
      message: 'تم استلام طلب جديد من العميل أحمد محمد',
      type: 'order',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isRead: false
    },
    {
      id: '2',
      title: 'منتج منخفض المخزون',
      message: 'المنتج "منظف الأرضيات" وصل إلى الحد الأدنى للمخزون',
      type: 'product',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isRead: false
    },
    {
      id: '3',
      title: 'تحديث النظام',
      message: 'تم تحديث النظام إلى الإصدار الجديد بنجاح',
      type: 'system',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      isRead: true
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.updateUnreadCount();
    this.loadCurrentUser();
    
    // Listen for sidebar state changes
    window.addEventListener('sidebarStateChanged', (event: any) => {
      this.isMobileMenuOpen = !event.detail.isCollapsed;
    });
  }

  loadCurrentUser(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user loaded in header:', this.currentUser);
  }

  updateUnreadCount(): void {
    this.unreadCount = this.recentNotifications.filter(n => !n.isRead).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  toggleMobileMenu(): void {
    // Prevent multiple rapid clicks
    if (this.isMenuToggling) return;
    
    this.isMenuToggling = true;
    
    // Toggle the menu state immediately for smooth UI
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Emit event to parent component to toggle sidebar
    const event = new CustomEvent('toggleMobileMenu', {
      detail: { 
        timestamp: Date.now(),
        isOpen: this.isMobileMenuOpen
      }
    });
    window.dispatchEvent(event);
    
    // Reset flag after a short delay
    setTimeout(() => {
      this.isMenuToggling = false;
    }, 200);
  }

  markAllAsRead(): void {
    this.recentNotifications.forEach(notification => {
      notification.isRead = true;
    });
    this.updateUnreadCount();
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
    this.showNotifications = false;
  }

  handleNotificationClick(notification: Notification): void {
    if (!notification.isRead) {
      notification.isRead = true;
      this.updateUnreadCount();
    }
    
    // Handle navigation based on notification type
    switch (notification.type) {
      case 'order':
        this.router.navigate(['/orders']);
        break;
      case 'product':
        this.router.navigate(['/products']);
        break;
      case 'system':
        this.router.navigate(['/settings']);
        break;
      case 'promotion':
        this.router.navigate(['/reports']);
        break;
    }
    
    this.showNotifications = false;
  }

  getNotificationIconClass(type: string): string {
    const baseClasses = 'w-8 h-8 rounded-full flex items-center justify-center';
    const typeClasses = {
      order: 'bg-blue-100 text-blue-600',
      product: 'bg-green-100 text-green-600',
      system: 'bg-purple-100 text-purple-600',
      promotion: 'bg-yellow-100 text-yellow-600'
    };
    
    return `${baseClasses} ${typeClasses[type as keyof typeof typeClasses] || 'bg-gray-100 text-gray-600'}`;
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
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} يوم`;
    }
  }

  showLogoutConfirmation(): void {
    this.showLogoutDialog = true;
  }

  cancelLogout(): void {
    this.showLogoutDialog = false;
  }

  confirmLogout(): void {
    this.showLogoutDialog = false;
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
