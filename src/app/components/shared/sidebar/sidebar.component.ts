import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  title: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  isMobile = false;
  menuItems: MenuItem[] = [
    {
      title: 'لوحة التحكم',
      route: '/dashboard',
      icon: 'dashboard'
    },
    {
      title: 'المنتجات',
      route: '/products',
      icon: 'products'
    },
    {
      title: 'الأصناف',
      route: '/categories',
      icon: 'categories'
    },
    {
      title: 'الطلبات',
      route: '/orders',
      icon: 'orders'
    },
    {
      title: 'المستخدمين',
      route: '/users',
      icon: 'users'
    },
    {
      title: 'الكوبونات',
      route: '/coupons',
      icon: 'coupons'
    },
    // {
    //   title: 'التقارير',
    //   route: '/reports',
    //   icon: 'reports'
    // },
    // {
    //   title: 'الإعدادات',
    //   route: '/settings',
    //   icon: 'settings'
    // }
  ];

  constructor() { }

  ngOnInit(): void {
    this.checkScreenSize();
    
    // Listen for window resize events with debouncing
    let resizeTimeout: any;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.checkScreenSize();
      }, 100);
    });

    // Listen for mobile menu toggle events with debouncing
    let lastToggleTime = 0;
    window.addEventListener('toggleSidebar', () => {
      const now = Date.now();
      // Prevent rapid toggles
      if (now - lastToggleTime < 150) return;
      lastToggleTime = now;
      
      this.toggleSidebar();
    });
  }

  private checkScreenSize(): void {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth < 1024;
    
    // Auto-collapse on mobile by default
    if (this.isMobile) {
      this.isCollapsed = true;
      document.body.style.overflow = 'auto';
    } else if (wasMobile && !this.isMobile) {
      // When switching from mobile to desktop, reset state
      this.isCollapsed = false;
      document.body.style.overflow = 'auto';
    }
    
    // Notify header about state change
    const stateEvent = new CustomEvent('sidebarStateChanged', {
      detail: { 
        isCollapsed: this.isCollapsed,
        isMobile: this.isMobile
      }
    });
    window.dispatchEvent(stateEvent);
  }

  toggleSidebar(): void {
    // Add smooth animation class
    this.isCollapsed = !this.isCollapsed;
    
    // Force reflow for smooth animation
    if (this.isMobile) {
      document.body.style.overflow = this.isCollapsed ? 'auto' : 'hidden';
    }
    
    // Notify header about state change
    const stateEvent = new CustomEvent('sidebarStateChanged', {
      detail: { 
        isCollapsed: this.isCollapsed,
        isMobile: this.isMobile
      }
    });
    window.dispatchEvent(stateEvent);
  }

  onMenuItemClick(): void {
    // Auto-close sidebar on mobile when a menu item is clicked
    if (this.isMobile) {
      this.isCollapsed = true;
      
      // Notify header about state change
      const stateEvent = new CustomEvent('sidebarStateChanged', {
        detail: { 
          isCollapsed: this.isCollapsed,
          isMobile: this.isMobile
        }
      });
      window.dispatchEvent(stateEvent);
      
      // Reset body overflow
      document.body.style.overflow = 'auto';
    }
  }

  getIconPath(icon: string): string {
    const iconPaths: { [key: string]: string } = {
      dashboard: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z',
      products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      categories: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      orders: 'M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01',
      users: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
      coupons: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
      reports: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    };

    return iconPaths[icon] || '';
  }
}
