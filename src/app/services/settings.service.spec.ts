import { TestBed } from '@angular/core/testing';
import { SettingsService, Settings } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockLocalStorage: { [key: string]: string } = {};

  beforeEach(() => {
    // محاكاة localStorage
    spyOn(localStorage, 'getItem').and.callFake((key: string) => mockLocalStorage[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    TestBed.configureTestingModule({
      providers: [SettingsService]
    });
    service = TestBed.inject(SettingsService);
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return default settings when no stored settings exist', (done) => {
    service.getSettings().subscribe(settings => {
      expect(settings.siteName).toBe('متجر الفتح');
      expect(settings.currency).toBe('EGP');
      expect(settings.currencySymbol).toBe('ج.م');
      done();
    });
  });

  it('should load settings from localStorage', (done) => {
    const storedSettings = {
      siteName: 'متجر مخصص',
      contactEmail: 'custom@example.com'
    };
    mockLocalStorage['app_settings'] = JSON.stringify(storedSettings);

    // إعادة إنشاء الخدمة لتحميل الإعدادات الجديدة
    const newService = new SettingsService();
    
    newService.getSettings().subscribe(settings => {
      expect(settings.siteName).toBe('متجر مخصص');
      expect(settings.contactEmail).toBe('custom@example.com');
      expect(settings.currency).toBe('EGP'); // القيمة الافتراضية
      done();
    });
  });

  it('should save settings to localStorage', (done) => {
    const testSettings: Settings = {
      siteName: 'متجر الاختبار',
      siteDescription: 'وصف الاختبار',
      siteLogo: '',
      contactEmail: 'test@example.com',
      contactPhone: '+20 123 456 789',
      contactAddress: 'عنوان الاختبار',
      currency: 'USD',
      currencySymbol: '$',
      orderNotificationEmail: 'orders@test.com',
      autoConfirmOrders: true,
      requireOrderConfirmation: false,
      freeShippingThreshold: 1000,
      shippingCost: 25,
      taxRate: 10,
      includeTaxInPrice: true,
      requireStrongPasswords: false,
      sessionTimeout: 60,
      emailNotifications: false,
      smsNotifications: true,
      pushNotifications: false
    };

    service.saveSettings(testSettings).subscribe(success => {
      expect(success).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('app_settings', JSON.stringify(testSettings));
      done();
    });
  });

  it('should calculate shipping cost correctly', () => {
    const settings = service.getCurrentSettings();
    settings.freeShippingThreshold = 500;
    settings.shippingCost = 50;

    // طلب أقل من حد الشحن المجاني
    expect(service.calculateShippingCost(300)).toBe(50);
    
    // طلب يساوي حد الشحن المجاني
    expect(service.calculateShippingCost(500)).toBe(0);
    
    // طلب أكبر من حد الشحن المجاني
    expect(service.calculateShippingCost(1000)).toBe(0);
  });

  it('should calculate tax correctly', () => {
    const settings = service.getCurrentSettings();
    settings.taxRate = 14;

    expect(service.calculateTax(100)).toBe(14);
    expect(service.calculateTax(200)).toBe(28);
    expect(service.calculateTax(0)).toBe(0);
  });

  it('should format price correctly', () => {
    const settings = service.getCurrentSettings();
    settings.currencySymbol = 'ج.م';

    expect(service.formatPrice(100)).toBe('100.00 ج.م');
    expect(service.formatPrice(99.99)).toBe('99.99 ج.م');
    expect(service.formatPrice(0)).toBe('0.00 ج.م');
  });

  it('should return current settings', () => {
    const currentSettings = service.getCurrentSettings();
    expect(currentSettings).toBeDefined();
    expect(currentSettings.siteName).toBe('متجر الفتح');
  });

  it('should handle localStorage errors gracefully', () => {
    spyOn(localStorage, 'setItem').and.throwError('Storage error');
    spyOn(console, 'error');

    const testSettings = service.getCurrentSettings();
    service.saveSettings(testSettings).subscribe({
      next: () => fail('Should have thrown an error'),
      error: (error) => {
        expect(console.error).toHaveBeenCalled();
      }
    });
  });

  it('should handle invalid JSON in localStorage', () => {
    mockLocalStorage['app_settings'] = 'invalid-json';
    spyOn(console, 'error');

    const newService = new SettingsService();
    
    expect(console.error).toHaveBeenCalled();
  });

  it('should provide helper methods for specific settings', () => {
    expect(service.getSiteName()).toBe('متجر الفتح');
    expect(service.getCurrencySymbol()).toBe('ج.م');
    expect(service.getTaxRate()).toBe(14);
    expect(service.getShippingCost()).toBe(50);
    expect(service.getFreeShippingThreshold()).toBe(500);
    expect(service.isEmailNotificationsEnabled()).toBe(true);
    expect(service.isSmsNotificationsEnabled()).toBe(false);
    expect(service.isPushNotificationsEnabled()).toBe(true);
  });
}); 