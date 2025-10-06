import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface Settings {
  // إعدادات الموقع
  siteName: string;
  siteDescription: string;
  siteLogo: string;
  
  // إعدادات الاتصال
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  
  // إعدادات العملة
  currency: string;
  currencySymbol: string;
  
  // إعدادات الطلبات
  orderNotificationEmail: string;
  autoConfirmOrders: boolean;
  requireOrderConfirmation: boolean;
  
  // إعدادات الشحن
  freeShippingThreshold: number;
  shippingCost: number;
  
  // إعدادات الضرائب
  taxRate: number;
  includeTaxInPrice: boolean;
  
  // إعدادات الأمان
  requireStrongPasswords: boolean;
  sessionTimeout: number;
  
  // إعدادات الإشعارات
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<Settings>(this.getDefaultSettings());
  public settings$ = this.settingsSubject.asObservable();

  constructor() {
    this.loadSettingsFromStorage();
  }

  private getDefaultSettings(): Settings {
    return {
      siteName: 'متجر الفتح',
      siteDescription: 'متجر إلكتروني متخصص في بيع المنتجات عالية الجودة',
      siteLogo: '',
      contactEmail: 'info@elfateh.com',
      contactPhone: '+20 123 456 789',
      contactAddress: 'القاهرة، مصر',
      currency: 'EGP',
      currencySymbol: 'ج.م',
      orderNotificationEmail: 'orders@elfateh.com',
      autoConfirmOrders: false,
      requireOrderConfirmation: true,
      freeShippingThreshold: 500,
      shippingCost: 50,
      taxRate: 14,
      includeTaxInPrice: false,
      requireStrongPasswords: true,
      sessionTimeout: 30,
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true
    };
  }

  private loadSettingsFromStorage(): void {
    try {
      const storedSettings = localStorage.getItem('app_settings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        this.settingsSubject.next({ ...this.getDefaultSettings(), ...settings });
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات من التخزين المحلي:', error);
    }
  }

  private saveSettingsToStorage(settings: Settings): void {
    try {
      localStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات في التخزين المحلي:', error);
    }
  }

  getSettings(): Observable<Settings> {
    return this.settings$;
  }

  getCurrentSettings(): Settings {
    return this.settingsSubject.value;
  }

  updateSettings(settings: Partial<Settings>): Observable<Settings> {
    const currentSettings = this.settingsSubject.value;
    const updatedSettings = { ...currentSettings, ...settings };
    
    // محاكاة طلب API
    return of(updatedSettings).pipe(
      delay(1000) // محاكاة تأخير الشبكة
    );
  }

  saveSettings(settings: Settings): Observable<boolean> {
    return new Observable(observer => {
      // محاكاة حفظ الإعدادات في الخادم
      setTimeout(() => {
        try {
          this.settingsSubject.next(settings);
          this.saveSettingsToStorage(settings);
          observer.next(true);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      }, 1000);
    });
  }

  resetSettings(): Observable<Settings> {
    const defaultSettings = this.getDefaultSettings();
    return this.saveSettings(defaultSettings).pipe(
      delay(500),
      () => of(defaultSettings)
    );
  }

  // دوال مساعدة للحصول على إعدادات محددة
  getSiteName(): string {
    return this.settingsSubject.value.siteName;
  }

  getCurrencySymbol(): string {
    return this.settingsSubject.value.currencySymbol;
  }

  getTaxRate(): number {
    return this.settingsSubject.value.taxRate;
  }

  getShippingCost(): number {
    return this.settingsSubject.value.shippingCost;
  }

  getFreeShippingThreshold(): number {
    return this.settingsSubject.value.freeShippingThreshold;
  }

  isEmailNotificationsEnabled(): boolean {
    return this.settingsSubject.value.emailNotifications;
  }

  isSmsNotificationsEnabled(): boolean {
    return this.settingsSubject.value.smsNotifications;
  }

  isPushNotificationsEnabled(): boolean {
    return this.settingsSubject.value.pushNotifications;
  }

  // دالة لحساب تكلفة الشحن
  calculateShippingCost(orderTotal: number): number {
    const settings = this.settingsSubject.value;
    if (orderTotal >= settings.freeShippingThreshold) {
      return 0;
    }
    return settings.shippingCost;
  }

  // دالة لحساب الضريبة
  calculateTax(amount: number): number {
    const settings = this.settingsSubject.value;
    return (amount * settings.taxRate) / 100;
  }

  // دالة لتنسيق السعر
  formatPrice(price: number): string {
    const settings = this.settingsSubject.value;
    return `${price.toFixed(2)} ${settings.currencySymbol}`;
  }
} 