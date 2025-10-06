import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CategoriesService } from '../../../services/categories.service';
import { PaginationComponent, PaginationInfo } from '../../shared/pagination/pagination.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/confirm-dialog/confirm-dialog.component';

interface Category {
  id: string;
  name?: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  image?: string;
  isActive: boolean;
  parent?: string;
  ancestors?: string[];
  subCategories?: Category[];
  productCount?: number;
  createdAt?: string;
  type?: string;
}

@Component({
  selector: 'app-categories-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent, ConfirmDialogComponent],
  templateUrl: './categories-list.component.html',
  styleUrl: './categories-list.component.scss'
})
export class CategoriesListComponent implements OnInit {
  categories: any[] = [];
  paginatedCategories: any[] = [];
  isLoading = false;
  error = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10; // Show 10 items per page
  totalItems = 0;
  pagination: any = {};
  
  // Search
  searchTerm = '';
  filteredCategories: any[] = [];
  
  // View options - Always show main categories with their subcategories
  
  // Collapse state
  expandedCategories: Set<string> = new Set();
  
  // Confirm Dialog
  showConfirmDialog = false;
  confirmDialogData: ConfirmDialogData | null = null;
  itemToDelete: { id: string; type: 'category' | 'subcategory'; parentId?: string } | null = null;

  constructor(
    private categoriesService: CategoriesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.error = '';
    
    this.categoriesService.getCategories().subscribe({
      next: (response: any) => {
        const allCategories = response?.data || response || [];
        
        console.log('Categories received from API:', allCategories);
        
        // Always show only main categories (no parent) and organize their subcategories
        this.categories = allCategories.filter((category: any) => {
          return !category.parentId && !category.parent;
        });
        
        // Load subcategories for each main category
        this.categories.forEach(category => {
          // Initialize subcategories array if not exists
          if (!category.subCategories) {
            category.subCategories = [];
          }
          this.loadSubcategoriesForCategory(category.id);
        });
        
        console.log('Showing main categories with subcategories:', this.categories.length);
        
        this.filteredCategories = [...this.categories];
        this.totalItems = this.categories.length;
        
        this.updatePagination();
        console.log('Displaying', this.paginatedCategories.length, 'main categories out of', this.totalItems);
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('API Error:', error);
        this.error = 'حدث خطأ في تحميل الأصناف';
        this.isLoading = false;
      }
    });
  }


  // Search functionality
  onSearchInput(): void {
    if (!this.searchTerm.trim()) {
      this.filteredCategories = [...this.categories];
    } else {
      this.filteredCategories = this.categories.filter(category => {
        const searchLower = this.searchTerm.toLowerCase();
        
        // Check main category
        const mainCategoryMatches = (
          (category.nameAr && category.nameAr.toLowerCase().includes(searchLower)) ||
          (category.name && category.name.toLowerCase().includes(searchLower)) ||
          (category.descriptionAr && category.descriptionAr.toLowerCase().includes(searchLower)) ||
          (category.description && category.description.toLowerCase().includes(searchLower))
        );
        
        // Check subcategories
        const subcategoryMatches = category.subCategories && category.subCategories.some((sub: any) => {
          return (
            (sub.nameAr && sub.nameAr.toLowerCase().includes(searchLower)) ||
            (sub.name && sub.name.toLowerCase().includes(searchLower)) ||
            (sub.descriptionAr && sub.descriptionAr.toLowerCase().includes(searchLower)) ||
            (sub.description && sub.description.toLowerCase().includes(searchLower))
          );
        });
        
        return mainCategoryMatches || subcategoryMatches;
      });
    }
    
    this.currentPage = 1;
    this.totalItems = this.filteredCategories.length;
    this.updatePagination();
    
  }

  // Clear search
  clearSearch(): void {
    this.searchTerm = '';
    this.onSearchInput();
  }

  // Pagination
  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedCategories = this.filteredCategories.slice(startIndex, endIndex);
    
    // Count only main categories for pagination
    const mainCategoriesCount = this.filteredCategories.length;
    
    this.pagination = {
      current: this.currentPage,
      pages: Math.ceil(mainCategoriesCount / this.pageSize),
      total: mainCategoriesCount,
      limit: this.pageSize
    };
    
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Collapse functionality
  toggleSubcategories(categoryId: string): void {
    if (this.expandedCategories.has(categoryId)) {
      this.expandedCategories.delete(categoryId);
    } else {
      this.expandedCategories.add(categoryId);
      
      // Load subcategories if not already loaded
      this.loadSubcategoriesForCategory(categoryId);
    }
  }

  loadSubcategoriesForCategory(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    
    // If subcategories are already loaded, don't reload
    if (category && category.subCategories && category.subCategories.length > 0) {
      return;
    }
    
    // Load subcategories from API
    this.categoriesService.getSubCategories(categoryId).subscribe({
      next: (subcategories: any) => {
        if (category) {
          // Filter to only show subcategories that have this category as parent
          const filteredSubcategories = (subcategories || []).filter((sub: any) => {
            return sub.parentId === categoryId || sub.parent === categoryId || 
                   (sub.parent && sub.parent.id === categoryId);
          });
          
          category.subCategories = filteredSubcategories;
          
          // Update pagination if needed
          this.updatePagination();
        }
      },
      error: (error) => {
        console.error('Error loading subcategories:', error);
        if (category) {
          category.subCategories = [];
        }
      }
    });
  }

  isExpanded(categoryId: string): boolean {
    return this.expandedCategories.has(categoryId);
  }

  // Category actions
  addNewCategory(): void {
    this.router.navigate(['/categories/add']);
  }

  editCategory(categoryId: string): void {
    // Add query param to indicate this is a main category edit
    this.router.navigate(['/categories/edit', categoryId], {
      queryParams: { type: 'main' }
    });
  }

  deleteCategory(categoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    const categoryName = category?.nameAr || category?.name || 'هذا الصنف';
    
    this.itemToDelete = { id: categoryId, type: 'category' };
    this.confirmDialogData = {
      title: 'حذف الصنف',
      message: `هل أنت متأكد من حذف "${categoryName}"؟\nسيتم حذف جميع الأصناف الفرعية التابعة له أيضاً.`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    };
    this.showConfirmDialog = true;
  }

  // Subcategory actions
  addSubcategory(parentCategoryId: string): void {
    this.router.navigate(['/categories/add'], { 
      queryParams: { 
        parentId: parentCategoryId,
        type: 'sub'
      } 
    });
  }

  editSubcategory(subcategoryId: string): void {
    // Add query param to indicate this is a subcategory edit
    this.router.navigate(['/categories/edit', subcategoryId], {
      queryParams: { type: 'sub' }
    });
  }

  viewSubcategoryProducts(subcategoryId: string): void {
    // Navigate to products page filtered by subcategory
    this.router.navigate(['/products'], {
      queryParams: { subcategory: subcategoryId }
    });
  }

  deleteSubcategory(categoryId: string, subcategoryId: string): void {
    const category = this.categories.find(c => c.id === categoryId);
    const subcategory = category?.subCategories?.find((s: any) => s.id === subcategoryId);
    const subcategoryName = subcategory?.nameAr || subcategory?.name || 'هذا الصنف الفرعي';
    
    this.itemToDelete = { id: subcategoryId, type: 'subcategory', parentId: categoryId };
    this.confirmDialogData = {
      title: 'حذف الصنف الفرعي',
      message: `هل أنت متأكد من حذف "${subcategoryName}"؟`,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
      type: 'danger'
    };
    this.showConfirmDialog = true;
  }

  // Confirm Dialog handlers
  onConfirmDelete(): void {
    if (!this.itemToDelete) return;

    const { id, type, parentId } = this.itemToDelete;
    
    this.categoriesService.deleteCategory(id).subscribe({
      next: () => {
        this.loadCategories();
        this.closeConfirmDialog();
      },
      error: (error) => {
        alert(`حدث خطأ في حذف ${type === 'category' ? 'الصنف' : 'الصنف الفرعي'}`);
        this.closeConfirmDialog();
      }
    });
  }

  onCancelDelete(): void {
    this.closeConfirmDialog();
  }

  closeConfirmDialog(): void {
    this.showConfirmDialog = false;
    this.confirmDialogData = null;
    this.itemToDelete = null;
  }

  // Utility methods
  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  getCategoryImage(category: any): string {
    // Check if category has an image
    if (category.image && category.image.trim() !== '') {
      return category.image;
    }
    
    // Check if category has an icon (legacy support)
    if (category.icon && category.icon.trim() !== '') {
      return category.icon;
    }
    
    // Return default image based on category type
    if (category.type === 'sub') {
      return '/assets/images/default-subcategory.svg';
    }
    
    return '/assets/images/default-category.svg';
  }

  getActiveCategoriesCount(): number {
    return this.categories.filter(cat => cat.isActive).length;
  }

  getStatusText(category: any): string {
    return category.isActive ? 'نشط' : 'غير نشط';
  }

  getStatusBadgeClass(category: any): string {
    return category.isActive 
      ? 'bg-green-100 text-green-800 border border-green-200' 
      : 'bg-red-100 text-red-800 border border-red-200';
  }

  // TrackBy functions for performance
  trackByCategory(index: number, category: any): string {
    return category.id || index;
  }

  trackBySubcategory(index: number, subcategory: any): string {
    return subcategory.id || index;
  }
}