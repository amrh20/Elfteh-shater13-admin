import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriesService } from '../../../services/categories.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent implements OnInit {
  category: any = {
    nameAr: '',
    descriptionAr: '',
    image: '',
    type: 'main',
    parentId: '',
    isActive: true
  };

  isEditMode = false;
  isLoading = false;
  parentCategories: any[] = [];
  errorMessage = '';
  
  // Mode flags for showing/hiding category type options
  isMainCategoryMode = false;
  isSubcategoryMode = false;

  constructor(
    private categoriesService: CategoriesService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const categoryId = this.route.snapshot.paramMap.get('id');
    const parentId = this.route.snapshot.queryParamMap.get('parentId');
    const type = this.route.snapshot.queryParamMap.get('type');
    
    // Set mode flags based on query parameters
    if (type === 'main') {
      this.isMainCategoryMode = true;
      this.isSubcategoryMode = false;
      this.category.type = 'main';
    } else if (type === 'sub') {
      this.isMainCategoryMode = false;
      this.isSubcategoryMode = true;
      this.category.type = 'sub';
    }
    
    // Clear any default values immediately
    this.category.image = '';
    this.category.icon = '';
    
    // Check if parentId is provided in query params (for subcategories)
    if (parentId) {
      this.category.type = 'sub';
      // Ensure parentId is a string
      this.category.parentId = parentId.toString();
      this.isMainCategoryMode = false;
      this.isSubcategoryMode = true;
      
      // Load parent categories immediately for subcategories
      this.loadParentCategories();
    } else {
      // Load parent categories normally
      this.loadParentCategories();
    }
    
    if (categoryId) {
      this.isEditMode = true;
      this.loadCategory(categoryId);
    }
  }



  loadCategory(id: string): void {
    this.isLoading = true;
    this.categoriesService.getCategory(id).subscribe({
      next: (category: any) => {
        if (category) {

          
          this.category = { ...category };

          
          // Check if this is a subcategory and set type accordingly
          if (category.parentId || category.parent) {
            this.category.type = 'sub';
            this.isMainCategoryMode = false;
            this.isSubcategoryMode = true;
            
            // Set parentId from either parentId or parent field
            if (category.parentId) {
              // Ensure parentId is a string, not an object
              this.category.parentId = typeof category.parentId === 'object' ? category.parentId.id : category.parentId;
            } else if (category.parent && typeof category.parent === 'string') {
              this.category.parentId = category.parent;
            } else if (category.parent && typeof category.parent === 'object' && category.parent.id) {
              this.category.parentId = category.parent.id;
            }
            
            // Force change detection for parentId binding
            setTimeout(() => {
              this.category = { ...this.category };
            }, 100);

          } else {
            this.category.type = 'main';
            this.isMainCategoryMode = true;
            this.isSubcategoryMode = false;
            this.category.parentId = '';

          }
          
          // Set the category ID for editing
          this.category.id = id;
          
          // Clear any unwanted default values
          if (!this.category.image || this.category.image === 'folder') {
            this.category.image = '';
          }
          
          // Remove icon field completely if it exists
          if (this.category.icon) {
            delete this.category.icon;
          }
          

        }
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'خطأ في تحميل بيانات الصنف';
        this.isLoading = false;
      }
    });
  }

  loadParentCategories(): void {
    this.categoriesService.getMainCategories().subscribe({
      next: (categories: any) => {
        this.parentCategories = categories;
        
        // If we're in subcategory mode and have a parentId, ensure it's set correctly
        if (this.isSubcategoryMode && this.category.parentId && categories.length > 0) {
          // Ensure parentId is a string for comparison
          const currentParentId = this.category.parentId.toString();
          // Verify that the parentId exists in the loaded categories
          const parentExists = categories.some((cat: any) => cat.id.toString() === currentParentId);
          if (!parentExists) {
            // If parent doesn't exist, clear the parentId
            this.category.parentId = '';
          }
        }
        
        // Force change detection for parentId binding
        setTimeout(() => {
          if (this.isSubcategoryMode && this.category.parentId) {
            // Trigger change detection manually
            this.category = { ...this.category };
          }
        }, 100);
      },
      error: (error: any) => {
        this.errorMessage = 'خطأ في تحميل الأصناف الرئيسية';
      }
    });
  }

  isFormValid(): boolean {
    // Basic validation - only Arabic fields are required
    if (!this.category.nameAr) {
      return false;
    }

    // If it's a sub category, parent must be selected
    if (this.category.type === 'sub' && !this.category.parentId) {
      return false;
    }



    return true;
  }

  onSubmit(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'يرجى ملء جميع الحقول المطلوبة';
      return;
    }

    this.errorMessage = '';

    // Clean the data before sending
    this.cleanCategoryData();

    if (this.isEditMode) {
      this.updateCategory();
    } else {
      this.createCategory();
    }
  }

  cleanCategoryData(): void {
    // Remove empty or default values
    if (!this.category.image || this.category.image.trim() === '') {
      delete this.category.image;
    }

    // Remove icon field completely
    delete this.category.icon;


  }

  createCategory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Remove ID if it exists (for new categories)
    const categoryData = { ...this.category };
    delete categoryData.id;



    this.categoriesService.createCategory(categoryData).subscribe({
      next: (category: any) => {
        this.isLoading = false;
        this.router.navigate(['/categories']);
      },
      error: (error: any) => {
        this.errorMessage = error.message || 'خطأ في إنشاء الصنف';
        this.isLoading = false;
      }
    });
  }

  updateCategory(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const categoryId = this.category.id || this.route.snapshot.paramMap.get('id');
    if (categoryId) {


      this.categoriesService.updateCategory(categoryId, this.category).subscribe({
        next: (category: any) => {

          this.isLoading = false;
          this.router.navigate(['/categories']);
        },
        error: (error: any) => {
          this.errorMessage = error.message || 'خطأ في تحديث الصنف';
          this.isLoading = false;
        }
      });
    } else {

      this.errorMessage = 'خطأ: لم يتم العثور على معرف الصنف';
      this.isLoading = false;
    }
  }

  onTypeChange(): void {
    if (this.category.type === 'main') {
      this.category.parentId = '';
    }

    // Clear image field when type changes
    this.category.image = '';

    // Force change detection
    this.category = { ...this.category };
  }



  getImagePreview(): string {
    // Return the image URL if available
    if (this.category.image && this.category.image.trim() !== '') {
      return this.category.image;
    }

    // Return default image based on category type
    if (this.category.type === 'sub') {
      return '/assets/images/default-subcategory.svg';
    }

    return '/assets/images/default-category.svg';
  }

  onImageError(event: any): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.style.display = 'none';
    }
  }

  cancel(): void {
    this.router.navigate(['/categories']);
  }
}
