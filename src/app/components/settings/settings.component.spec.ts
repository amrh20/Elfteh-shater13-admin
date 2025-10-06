import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { SettingsComponent } from './settings.component';
import { SettingsService } from '../../services/settings.service';
import { of } from 'rxjs';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('SettingsService', [
      'getSettings',
      'saveSettings',
      'resetSettings',
      'getCurrentSettings'
    ]);

    await TestBed.configureTestingModule({
      imports: [SettingsComponent, ReactiveFormsModule],
      providers: [
        { provide: SettingsService, useValue: spy }
      ]
    }).compileComponents();

    settingsService = TestBed.inject(SettingsService) as jasmine.SpyObj<SettingsService>;
  });

  beforeEach(() => {
    // إعداد البيانات الوهمية
    const mockSettings = {
      siteName: 'متجر الفتح',
      siteDescription: 'متجر إلكتروني متخصص',
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

    settingsService.getSettings.and.returnValue(of(mockSettings));
    settingsService.saveSettings.and.returnValue(of(true));
    settingsService.resetSettings.and.returnValue(of(mockSettings));

    fixture = TestBed.createComponent(SettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with settings', () => {
    expect(component.settingsForm).toBeDefined();
    expect(component.settingsForm.get('siteName')?.value).toBe('متجر الفتح');
    expect(component.settingsForm.get('contactEmail')?.value).toBe('info@elfateh.com');
  });

  it('should validate required fields', () => {
    const siteNameControl = component.settingsForm.get('siteName');
    const contactEmailControl = component.settingsForm.get('contactEmail');
    
    siteNameControl?.setValue('');
    contactEmailControl?.setValue('');
    
    expect(siteNameControl?.invalid).toBeTruthy();
    expect(contactEmailControl?.invalid).toBeTruthy();
  });

  it('should validate email format', () => {
    const emailControl = component.settingsForm.get('contactEmail');
    
    emailControl?.setValue('invalid-email');
    expect(emailControl?.invalid).toBeTruthy();
    
    emailControl?.setValue('valid@email.com');
    expect(emailControl?.valid).toBeTruthy();
  });

  it('should save settings when form is valid', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.saveSettings();
    
    expect(settingsService.saveSettings).toHaveBeenCalled();
  });

  it('should reset settings when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.resetSettings();
    
    expect(settingsService.resetSettings).toHaveBeenCalled();
  });

  it('should show error message for invalid fields', () => {
    const siteNameControl = component.settingsForm.get('siteName');
    siteNameControl?.setValue('');
    siteNameControl?.markAsTouched();
    
    const errorMessage = component.getErrorMessage('siteName');
    expect(errorMessage).toBe('هذا الحقل مطلوب');
  });

  it('should unsubscribe on destroy', () => {
    spyOn(component['settingsSubscription'], 'unsubscribe');
    
    component.ngOnDestroy();
    
    expect(component['settingsSubscription'].unsubscribe).toHaveBeenCalled();
  });
}); 