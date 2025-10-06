import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CouponsService, Coupon } from '../../../services/coupons.service';

@Component({
  selector: 'app-coupon-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './coupon-form.component.html',
  styleUrl: './coupon-form.component.scss'
})
export class CouponFormComponent implements OnInit {
  couponForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  error: string | null = null;
  couponId: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private couponsService: CouponsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.couponForm = this.createForm();
  }

  ngOnInit(): void {
    this.couponId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.couponId;

    if (this.isEditMode && this.couponId) {
      // Always load from API to ensure we have the latest data
      this.loadCoupon(this.couponId);
      
      // Also check if coupon data was passed via router state for faster initial load
      const navigation = this.router.getCurrentNavigation();
      const couponData = navigation?.extras?.state?.['couponData'];
      
      if (couponData) {
        console.log('Using router state data for initial population');
        // Use passed data for immediate population while API loads
        this.populateForm(couponData);
      }
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      code: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      discount: [0, [Validators.required, Validators.min(0)]],
      expiresAt: ['', Validators.required]
    });
  }

  private loadCoupon(id: string): void {
    this.isLoading = true;
    this.error = null;

    this.couponsService.getCoupon(id).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        
        // Handle the API response structure
        const couponData = response.data || response;
        
        if (couponData) {
          this.populateForm(couponData);
        } else {
          this.error = 'لم يتم العثور على بيانات الكوبون';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading coupon:', error);
        this.error = 'حدث خطأ في تحميل بيانات الكوبون';
        this.isLoading = false;
      }
    });
  }

  private populateForm(coupon: any): void {
    console.log('Populating form with coupon data:', coupon);
    
    try {
      // Format date for input[type="datetime-local"]
      let formattedDate = '';
      if (coupon.expiresAt) {
        const expiresAt = new Date(coupon.expiresAt);
        // Check if date is valid
        if (!isNaN(expiresAt.getTime())) {
          formattedDate = expiresAt.toISOString().slice(0, 16);
        }
      }

      // Patch form with available data
      const formData: any = {};
      
      if (coupon.code !== undefined) {
        formData.code = coupon.code;
      }
      
      if (coupon.discount !== undefined) {
        formData.discount = Number(coupon.discount);
      }
      
      if (formattedDate) {
        formData.expiresAt = formattedDate;
      }
      
      console.log('Form data to patch:', formData);
      this.couponForm.patchValue(formData);
      
      // Mark form as pristine after loading
      this.couponForm.markAsPristine();
      
    } catch (error) {
      console.error('Error populating form:', error);
      this.error = 'خطأ في تحميل بيانات الكوبون';
    }
  }

  onSubmit(): void {
    if (this.couponForm.valid) {
      this.isLoading = true;
      this.error = null;

      const formData = this.prepareCouponData();

      const operation = this.isEditMode && this.couponId
        ? this.couponsService.updateCoupon(this.couponId, formData)
        : this.couponsService.createCoupon(formData);

      operation.subscribe({
        next: (response) => {
          this.router.navigate(['/coupons']);
        },
        error: (error) => {
          this.error = this.isEditMode ? 'حدث خطأ في تحديث الكوبون' : 'حدث خطأ في إنشاء الكوبون';
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private prepareCouponData(): Partial<Coupon> {
    const formValue = this.couponForm.value;
    
    const couponData: Partial<Coupon> = {
      code: formValue.code.trim(),
      discount: Number(formValue.discount),
      expiresAt: formValue.expiresAt
    };

    return couponData;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.couponForm.controls).forEach(key => {
      const control = this.couponForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.router.navigate(['/coupons']);
  }



  // Helper methods for form validation
  isFieldInvalid(fieldName: string): boolean {
    const field = this.couponForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.couponForm.get(fieldName);
    if (field && field.errors && (field.dirty || field.touched)) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['minlength']) {
        return `يجب أن يكون ${field.errors['minlength'].requiredLength} أحرف على الأقل`;
      }
      if (field.errors['maxlength']) {
        return `يجب أن يكون ${field.errors['maxlength'].requiredLength} أحرف على الأكثر`;
      }
      if (field.errors['min']) {
        return `القيمة يجب أن تكون ${field.errors['min'].min} أو أكثر`;
      }
      if (field.errors['max']) {
        return `القيمة يجب أن تكون ${field.errors['max'].max} أو أقل`;
      }
    }
    return '';
  }

  getPageTitle(): string {
    return this.isEditMode ? 'تعديل الكوبون' : 'إضافة كوبون جديد';
  }

  getSubmitButtonText(): string {
    if (this.isLoading) {
      return this.isEditMode ? 'جاري التحديث...' : 'جاري الحفظ...';
    }
    return this.isEditMode ? 'تحديث الكوبون' : 'حفظ الكوبون';
  }
}
