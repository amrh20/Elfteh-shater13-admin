import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable, map, catchError, of, delay } from 'rxjs';
import { ApiService } from '../../../services/api.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  product = {
    name: '',
    description: '',
    price: 0,
    subcategory: '',
    images: ['', '', ''],
    stock: 0,
    productType: 'normal',
    discount: 0,
    priceAfterDiscount: 0
  };

  subCategories: any = [];
  Categories: any = [];
  isSubmitting = false;
  errors: string[] = [];
  isSubcategoryPreSelected = false;
  isEditMode = false;
  productId: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    // Check if we're in edit mode
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.isEditMode = true;
      this.productId = productId;
      this.loadProductForEdit();
    }

    // Check if subcategory is passed via query params
    this.route.queryParamMap.subscribe(params => {
      const subcategoryId = params.get('subcategory');
      if (subcategoryId) {
        this.isSubcategoryPreSelected = true;
        this.product.subcategory = subcategoryId;
      }
    });

    // Load categories
    this.getCategories().subscribe((data) => {
      this.Categories = data;

      // Extract all subcategories into one array
      this.subCategories = this.extractAllSubcategories(data);
    });
  }

  getCategories(): Observable<any[]> {
    return this.apiService.get<any>('/categories').pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return this.Categories;
      }),
      catchError((error: any) => {
        console.error('Error fetching users from API:', error);
        return of(this.Categories).pipe(delay(500));
      })
    );
  }

  extractAllSubcategories(categories: any[]): any[] {
    const allSubcategories: any[] = [];

    categories.forEach(category => {
      if (category.subcategories && Array.isArray(category.subcategories)) {
        category.subcategories.forEach((subcategory: any) => {
          // Add parent category info to subcategory for reference
          const subcategoryWithParent = {
            ...subcategory,
            parentCategoryId: category.id,
            parentCategoryName: category.name
          };
          allSubcategories.push(subcategoryWithParent);
        });
      }
    });

    return allSubcategories;
  }

  loadProductForEdit(): void {
    // Get product data from router state or load from API
    const productData = history.state.product;
    if (productData) {
      this.populateFormWithProduct(productData);
    } else {
      // Load from API if not in state
      this.loadProductFromAPI();
    }
  }

  private populateFormWithProduct(productData: any): void {
    this.product = {
      name: productData.name || '',
      description: productData.description || '',
      price: productData.price || 0,
      subcategory: productData.subcategory || productData.category?._id || '',
      images: productData.images || ['', '', ''],
      stock: productData.stock || 0,
      productType: productData.productType || 'normal',
      discount: productData.discount || 0,
      priceAfterDiscount: productData.priceAfterDiscount || productData.price || 0
    };
    
    // Fill empty image slots if needed
    while (this.product.images.length < 3) {
      this.product.images.push('');
    }
  }

  private loadProductFromAPI(): void {
    if (!this.productId) return;
    
    this.apiService.get(`/products/${this.productId}`).subscribe({
      next: (response: any) => {
        const productData = response.data || response;
        this.populateFormWithProduct(productData);
      },
      error: (error: any) => {
        console.error('Error loading product:', error);
        // يمكن إضافة رسالة خطأ للمستخدم هنا
      }
    });
  }



  onProductTypeChange(): void {

    // Reset discount values when not special offer
    if (this.product.productType !== 'specialOffer') {
      this.product.discount = 0;
      this.product.priceAfterDiscount = this.product.price;
    }
  }

  validateForm(): boolean {
    this.errors = [];


    if (!this.product.name.trim()) {
      this.errors.push('اسم المنتج مطلوب');
    }

    if (!this.product.description.trim()) {
      this.errors.push('وصف المنتج مطلوب');
    }

    if (this.product.price <= 0) {
      this.errors.push('السعر يجب أن يكون أكبر من صفر');
    }

    if (!this.product.subcategory || this.product.subcategory === '') {
      this.errors.push('الصنف الفرعي مطلوب');
    }

    if (this.product.stock < 0) {
      this.errors.push('المخزون يجب أن يكون صفر أو أكثر');
    }

    if (this.product.images[0].trim() === '') {
      this.errors.push('يجب رفع صورة واحدة على الأقل للمنتج');
    }

    // Validate discount
    if (this.product.productType === 'specialOffer') {
      if (this.product.discount <= 0) {
        this.errors.push('قيمة الخصم يجب أن تكون أكبر من صفر');
      } else if (this.product.discount >= this.product.price) {
        this.errors.push('قيمة الخصم يجب أن تكون أقل من السعر الأصلي');
      }
    }

    return this.errors.length === 0;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      this.showErrorPopup();
      return;
    }

    this.isSubmitting = true;

    // Prepare the product data according to API structure
    const productData = this.prepareProductData();

    // Call API to create or update product
    if (this.isEditMode) {
      this.updateProduct(productData);
    } else {
      this.createProduct(productData);
    }
  }

  prepareProductData(): any {
    // Filter out empty image URLs
    const filteredImages = this.product.images.filter(img => img.trim() !== '');

    return {
      name: this.product.name,
      description: this.product.description,
      price: this.product.price,
      subcategory: this.product.subcategory,
      images: filteredImages,
      stock: this.product.stock,
      productType: this.product.productType,
      discount: this.product.discount,
      priceAfterDiscount: this.product.priceAfterDiscount
    };
  }

  createProduct(productData: any): void {
    this.apiService.post('/products', productData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.showSuccessPopup();

        // Smart redirect based on where user came from
        if (this.isSubcategoryPreSelected) {
          // Redirect back to the specific subcategory page
          this.router.navigate(['/products'], {
            queryParams: { subcategory: this.product.subcategory }
          });
        } else {
          // Redirect to general products page
          this.router.navigate(['/products']);
        }
      },
      error: (error: any) => {
        console.error('Error creating product:', error);
        this.isSubmitting = false;
        this.showErrorPopup('حدث خطأ أثناء حفظ المنتج. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  updateProduct(productData: any): void {
    if (!this.productId) return;

    this.apiService.put(`/products/${this.productId}`, productData).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;
        this.showSuccessPopup();

        // Redirect back to product details
        this.router.navigate(['/products', this.productId]);
      },
      error: (error: any) => {
        console.error('Error updating product:', error);
        this.isSubmitting = false;
        this.showErrorPopup('حدث خطأ أثناء تحديث المنتج. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  showErrorPopup(customMessage?: string): void {
    const message = customMessage || 'يرجى تصحيح الأخطاء التالية:\n' + this.errors.join('\n');
    this.errors = [message];
  }

  showSuccessPopup(): void {
    this.errors = [];
    // You can implement a success popup here if needed
  }

  clearErrors(): void {
    this.errors = [];
  }

  cancel(): void {
    if (this.product.images.some(img => img.trim() !== '') ||
      this.product.name ||
      this.product.description) {
      if (confirm('هل أنت متأكد من إلغاء التغييرات؟')) {
        this.router.navigate(['/products']);
      }
    } else {
      this.router.navigate(['/products']);
    }
  }

  calculatePriceAfterDiscount(): number {
    if (this.product.discount > 0) {
      return this.product.price - this.product.discount;
    }
    return this.product.price;
  }

  onSubcategoryChange(): void {
    // You can add any additional logic here when subcategory changes
  }

  // Calculate discount amount when discount changes
  onDiscountChange(): void {
    if (this.product.discount > 0 && this.product.price > 0) {
      this.product.priceAfterDiscount = this.product.price - this.product.discount;
    } else {
      this.product.priceAfterDiscount = this.product.price;
    }
  }

  getDiscountInputClass(): string {
    const baseClass = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent';

    if (this.product.discount >= this.product.price) {
      return baseClass + ' border-red-300 focus:ring-red-500 focus:border-red-500';
    } else if (this.product.discount > 0) {
      return baseClass + ' border-green-300 focus:ring-green-500 focus:border-green-500';
    } else {
      return baseClass + ' border-gray-300';
    }
  }

  getSubcategorySelectClass(): string {
    const baseClass = 'w-full px-4 py-3 border rounded-lg transition-all duration-200';

    if (this.isSubcategoryPreSelected) {
      return baseClass + ' border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed';
    } else {
      return baseClass + ' border-gray-300 bg-white text-gray-900 cursor-pointer hover:border-blue-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500';
    }
  }
}
