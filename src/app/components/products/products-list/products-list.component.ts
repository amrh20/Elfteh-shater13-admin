import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { ApiService } from '../../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaginationComponent, PaginationInfo } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-products-list',
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss'],
  standalone: true,
  imports:[CommonModule, FormsModule, PaginationComponent]
})
export class ProductsListComponent implements OnInit {
  products: any[] = [];
  isLoading = false;
  error: string | null = null;
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  totalProducts = 0;
  currentSubcategory: string | null = null;
  subcategoryName: string = '';
  
  // Categories and subcategories
  Categories: any[] = [];
  subCategories: any[] = [];
  
  // Filters object
  filters = {
    search: '',
    subcategory: '',
    productType: ''
  };
  
  // Helper for pagination
  Array = Array;

  constructor(
    private productsService: ProductsService,
    private apiService: ApiService,
    private route: ActivatedRoute,
    public router: Router
  ) {}

  ngOnInit(): void {
    // Load categories and subcategories
    this.loadCategories();
    
    // Get subcategory from query params
    this.route.queryParamMap.subscribe(params => {
      this.currentSubcategory = params.get('subcategory');
      if (this.currentSubcategory) {
        // Load products filtered by subcategory
        this.loadProducts();
        this.loadSubcategoryInfo();
      } else {
        // Load all products (admin view)
        this.loadAllProducts();
      }
    });
  }

  loadProducts(): void {
    if (!this.currentSubcategory) return;

    this.isLoading = true;
    this.error = null;

    const params = this.buildQueryParams();
    params.subcategory = this.currentSubcategory; // Override with current subcategory

    this.productsService.getProductsBySubcategory(
      this.currentSubcategory, 
      this.currentPage, 
      this.pageSize,
      params
    ).subscribe({
      next: (response: any) => {
        this.products = response.data || [];
        this.totalProducts = response.total || response.pagination?.total || 0;
        this.totalPages = response.pagination?.pages || Math.ceil(this.totalProducts / this.pageSize);
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'خطأ في تحميل المنتجات';
        this.isLoading = false;
      }
    });
  }

  loadAllProducts(): void {
    this.isLoading = true;
    this.error = null;

    const params = this.buildQueryParams();

    this.productsService.getProducts(this.currentPage, this.pageSize, params).subscribe({
      next: (response: any) => {
        this.products = response.data || [];
        this.totalProducts = response.pagination?.total || response.total || 0;
        this.totalPages = response.pagination?.pages || 1;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'خطأ في تحميل المنتجات';
        this.isLoading = false;
      }
    });
  }

  loadSubcategoryInfo(): void {
    if (!this.currentSubcategory) return;

    // You can add a service call here to get subcategory details
    // For now, we'll use a placeholder
    this.subcategoryName = 'التصنيف الفرعي';
  }

  loadCategories(): void {
    // Load categories from API
    this.apiService.get<any>('/categories').subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.Categories = response.data;
          // Extract all subcategories into one array
          this.subCategories = this.extractAllSubcategories(response.data);
          console.log('All subcategories:', this.subCategories);
        }
      },
      error: (error: any) => {
        console.error('Error fetching categories:', error);
        // Use mock data if API fails
        this.Categories = this.getMockCategories();
        this.subCategories = this.extractAllSubcategories(this.Categories);
      }
    });
  }

  private extractAllSubcategories(categories: any[]): any[] {
    const allSubcategories: any[] = [];
    
    categories.forEach(category => {
      if (category.subcategories && Array.isArray(category.subcategories)) {
        category.subcategories.forEach((subcategory: any) => {
          allSubcategories.push({
            id: subcategory._id || subcategory.id,
            name: subcategory.nameAr || subcategory.name
          });
        });
      }
    });
    
    return allSubcategories;
  }

  private getMockCategories(): any[] {
    return [
      {
        _id: '1',
        name: 'التنظيف',
        subcategories: [
          { _id: '1-1', name: 'منظفات الغسيل' },
          { _id: '1-2', name: 'منظفات المطبخ' }
        ]
      },
      {
        _id: '2',
        name: 'الإلكترونيات',
        subcategories: [
          { _id: '2-1', name: 'الهواتف' },
          { _id: '2-2', name: 'الحواسيب' }
        ]
      }
    ];
  }

  // Product Actions
  viewProductDetails(product: any): void {
    this.router.navigate(['/products', product._id || product.id]);
  }

  editProduct(product: any): void {
    this.router.navigate(['/products/edit', product._id || product.id], {
      state: { product: product }
    });
  }

  deleteProduct(product: any): void {
    if (confirm(`هل أنت متأكد من حذف المنتج "${product.nameAr || product.name}"؟`)) {
      this.isLoading = true;
      
      this.productsService.deleteProduct(product._id || product.id).subscribe({
        next: (response: any) => {
          console.log('Product deleted successfully:', response);
          this.isLoading = false;
          
          // Reload products
          if (this.currentSubcategory) {
            this.loadProducts();
          } else {
            this.loadAllProducts();
          }
        },
        error: (error: any) => {
          console.error('Error deleting product:', error);
          this.error = 'خطأ في حذف المنتج';
          this.isLoading = false;
        }
      });
    }
  }

  // Helper method to check if we're in subcategory view
  isSubcategoryView(): boolean {
    return !!this.currentSubcategory;
  }

  getPaginationInfo(): PaginationInfo {
    return {
      current: this.currentPage,
      pages: this.totalPages,
      total: this.totalProducts,
      limit: this.pageSize
    };
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    if (this.currentSubcategory) {
      this.loadProducts();
    } else {
      this.loadAllProducts();
    }
  }

  addNewProduct(): void {
    if (this.currentSubcategory) {
      // Navigate to add product with subcategory pre-selected
      this.router.navigate(['/products/add'], {
        queryParams: { subcategory: this.currentSubcategory }
      });
    } else {
      // Navigate to add product without subcategory
      this.router.navigate(['/products/add']);
    }
  }

  getStatusText(product: any): string {
    return product.isActive ? 'متوفر' : 'غير متوفر';
  }

  getStatusBadgeClass(product: any): string {
    return product.isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  }

  getOriginalPriceText(product: any): string {
    if (product.price) {
      return `${product.price} ج`;
    }
    return 'السعر غير محدد';
  }

  getFinalPriceText(product: any): string {
    if (product.productType === 'specialOffer' && product.discount > 0) {
      const discountedPrice = product.price - product.discount;
      return `${discountedPrice} ج`;
    }
    return this.getOriginalPriceText(product);
  }

  getDiscountPercentage(product: any): number {
    if (product.productType === 'specialOffer' && product.discount > 0 && product.price > 0) {
      return Math.round((product.discount / product.price) * 100);
    }
    return 0;
  }

  trackByProduct(index: number, product: any): any {
    return product._id || product.id;
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      // Set default image instead of hiding
      target.src = '/assets/images/default-product.svg';
    }
  }

  getProductImage(product: any): string {
    // Check if product has an image
    if (product.image && product.image.trim() !== '') {
      return product.image;
    }
    
    // Check if product has images array (legacy support)
    if (product.images && product.images.length > 0 && product.images[0]) {
      return product.images[0];
    }
    
    // Return default image
    return '/assets/images/default-product.svg';
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }


  sendFiltersToAPI(): void {
    console.log('🚀 Sending filters to API:', this.filters);
    
    // Show loading state
    this.isLoading = true;
    this.error = null;
    
    // Reset to first page
    this.currentPage = 1;
    
    // Send filters to API
    if (this.currentSubcategory) {
      this.loadProducts();
    } else {
      this.loadAllProducts();
    }
    
    // Log the API call details
    const apiParams = this.buildQueryParams();
    console.log('📡 API Parameters:', apiParams);
    console.log('🔗 API Endpoint:', this.currentSubcategory 
      ? `/products/subcategory/${this.currentSubcategory}` 
      : '/products/admin'
    );
    
    // Show success notification
  }

  // Helper method to build query params from filters
  private buildQueryParams(): any {
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    // Add filters only if they have values
    if (this.filters.search && this.filters.search.trim()) {
      params.search = this.filters.search.trim();
      console.log('📡 Adding search parameter:', params.search);
    }
    if (this.filters.subcategory) params.subcategory = this.filters.subcategory;
    if (this.filters.productType) params.productType = this.filters.productType;

    console.log('📡 Final API parameters:', params);
    return params;
  }

  /**
   * Handle search input changes
   */
  onSearchChange(): void {
    console.log('🔍 Search changed:', this.filters.search);
    // Reset to first page when searching
    this.currentPage = 1;
    // Apply search with small delay for better UX
    setTimeout(() => {
      console.log('🔍 Applying search after delay:', this.filters.search);
      this.applyFilters();
    }, 300);
  }

  /**
   * Handle filter changes (dropdown changes)
   */
  onFilterChange(): void {
    // Reset to first page when filters change
    this.currentPage = 1;
    // Apply filters immediately
    this.applyFilters();
  }

  /**
   * Apply all current filters and search
   */
  applyFilters(): void {
    console.log('🔍 Applying filters:', this.filters);
    // Reset to first page
    this.currentPage = 1;
    // Reload products with current filters
    if (this.currentSubcategory) {
      this.loadProducts();
    } else {
      this.loadAllProducts();
    }
  }

  /**
   * Clear all filters and search
   */
  clearFilters(): void {
    this.filters = {
      search: '',
      subcategory: '',
      productType: ''
    };
    this.currentPage = 1;
    if (this.currentSubcategory) {
      this.loadProducts();
    } else {
      this.loadAllProducts();
    }
  }
}
