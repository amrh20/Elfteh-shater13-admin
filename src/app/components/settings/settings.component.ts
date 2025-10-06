import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService, Settings } from '../../services/settings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit, OnDestroy {
  settingsForm!: FormGroup;
  isLoading = false;
  isSaved = false;
  private settingsSubscription?: Subscription;

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSettings();
  }

  ngOnDestroy(): void {
    if (this.settingsSubscription) {
      this.settingsSubscription.unsubscribe();
    }
  }

  initForm(): void {
    this.settingsForm = this.fb.group({
      // إعدادات الموقع
      siteName: ['', Validators.required],
      siteDescription: [''],
      siteLogo: [''],
      
      // إعدادات الاتصال
      contactEmail: ['', [Validators.required, Validators.email]],
      contactPhone: [''],
      contactAddress: [''],
      
      // إعدادات العملة
      currency: ['EGP', Validators.required],
      currencySymbol: ['ج.م', Validators.required],
      
      // إعدادات الطلبات
      orderNotificationEmail: ['', [Validators.required, Validators.email]],
      autoConfirmOrders: [false],
      requireOrderConfirmation: [true],
      
      // إعدادات الشحن
      freeShippingThreshold: [0, [Validators.min(0)]],
      shippingCost: [0, [Validators.min(0)]],
      
      // إعدادات الضرائب
      taxRate: [0, [Validators.min(0), Validators.max(100)]],
      includeTaxInPrice: [false],
      
      // إعدادات الأمان
      requireStrongPasswords: [true],
      sessionTimeout: [30, [Validators.min(5), Validators.max(120)]],
      
      // إعدادات الإشعارات
      emailNotifications: [true],
      smsNotifications: [false],
      pushNotifications: [true]
    });
  }

  loadSettings(): void {
    this.settingsSubscription = this.settingsService.getSettings().subscribe(settings => {
      this.settingsForm.patchValue(settings);
    });
  }

  saveSettings(): void {
    if (this.settingsForm.valid) {
      this.isLoading = true;
      
      this.settingsService.saveSettings(this.settingsForm.value).subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.isSaved = true;
            // إخفاء رسالة النجاح بعد 3 ثوان
            setTimeout(() => {
              this.isSaved = false;
            }, 3000);
          }
        },
        error: (error) => {
          console.error('خطأ في حفظ الإعدادات:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  resetSettings(): void {
    if (confirm('هل أنت متأكد من إعادة تعيين جميع الإعدادات؟')) {
      this.isLoading = true;
      this.settingsService.resetSettings().subscribe({
        next: (settings) => {
          this.settingsForm.patchValue(settings);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('خطأ في إعادة تعيين الإعدادات:', error);
          this.isLoading = false;
        }
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.settingsForm.controls).forEach(key => {
      const control = this.settingsForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.settingsForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (control.errors['email']) {
        return 'يرجى إدخال بريد إلكتروني صحيح';
      }
      if (control.errors['min']) {
        return `القيمة يجب أن تكون ${control.errors['min'].min} أو أكثر`;
      }
      if (control.errors['max']) {
        return `القيمة يجب أن تكون ${control.errors['max'].max} أو أقل`;
      }
    }
    return '';
  }
} 