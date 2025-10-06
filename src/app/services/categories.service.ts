import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  getCategories(): Observable<any[]> {
    // Get auth token for admin endpoint
    const token = localStorage.getItem('authToken');
    
    if (!token) {

      return this.getCategoriesFromPublic();
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    return this.apiService.get<any>('/categories/admin', {}, headers).pipe(
      map((response: any) => {

        if (response.success && response.data) {
          // Map API response to Category interface
          const mappedCategories = response.data.map((apiCategory: any) => this.mapApiResponseToCategory(apiCategory));
          return mappedCategories;
        } else {
          return this.getCategoriesFromPublic();
        }
      }),
      switchMap((result: any) => {
        if (Array.isArray(result)) {
          return of(result);
        } else {
          return this.getCategoriesFromPublic();
        }
      }),
      catchError((error: any) => {

        return this.getCategoriesFromPublic();
      })
    );
  }

  // Get public categories for comparison
  getPublicCategories(): Observable<any> {

    
    return this.apiService.get<any>('/categories').pipe(
      map((response: any) => {

        return response;
      }),
      catchError((error: any) => {

        return of({ error: error.message || 'Unknown error' });
      })
    );
  }

  // Get categories from public endpoint as fallback
  getCategoriesFromPublic(): Observable<any[]> {

    
    return this.apiService.get<any>('/categories').pipe(
      map((response: any) => {

        if (response.success && response.data) {
          const mappedCategories = response.data.map((apiCategory: any) => this.mapApiResponseToCategory(apiCategory));

          return mappedCategories;
        } else {

          return [];
        }
      }),
      catchError((error: any) => {

        return of([]);
      })
    );
  }

  // Map API response to Category interface
  private mapApiResponseToCategory(apiCategory: any): any {
    return {
      id: apiCategory._id || apiCategory.id,
      name: apiCategory.name || '',
      nameAr: apiCategory.nameAr || apiCategory.name || '', // Fallback to English name
      description: apiCategory.description || '',
      descriptionAr: apiCategory.descriptionAr || apiCategory.description || '', // Fallback to English description
      icon: apiCategory.icon || 'folder', // Default icon
      image: apiCategory.image || '',
      type: apiCategory.parent ? 'sub' : 'main', // Determine type based on parent
      parentId: apiCategory.parent || null,
      subCategories: apiCategory.subcategories ? apiCategory.subcategories.map((sub: any) => this.mapApiResponseToCategory(sub)) : [],
      productCount: apiCategory.productCount || 0,
      isActive: apiCategory.isActive !== undefined ? apiCategory.isActive : true,
      createdAt: apiCategory.createdAt ? new Date(apiCategory.createdAt) : new Date(),
      updatedAt: apiCategory.updatedAt ? new Date(apiCategory.updatedAt) : new Date()
    };
  }

  getCategory(id: string): Observable<any | undefined> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {

      return of(undefined);
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    return this.apiService.get<any>(`/categories/${id}`, {}, headers).pipe(
      map((response: any) => {
        if (response.success && response.data) {
          return this.mapApiResponseToCategory(response.data);
        }
        return undefined;
      }),
      catchError((error: any) => {

        return of(undefined);
      })
    );
  }

  createCategory(categoryData: any): Observable<any> {
    // Get auth token for admin endpoint
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found, cannot create category');
      throw new Error('Authentication required');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Prepare the request body according to API specification
    // Use Arabic fields as the main data
    const requestBody: any = {
      name: categoryData.nameAr, // Use Arabic name as the main name
      description: categoryData.descriptionAr // Use Arabic description as the main description
    };
    
    // Only add image if it exists and is not empty
    if (categoryData.image && categoryData.image.trim() !== '') {
      requestBody.image = categoryData.image;
    }
    
    // Add parent only for subcategories
    if (categoryData.type === 'sub' && categoryData.parentId) {
      requestBody.parent = categoryData.parentId;
    }



    return this.apiService.post<any>('/categories', requestBody, headers).pipe(
      map((response: any) => {

        if (response.success && response.data) {
          // Map API response back to our format
          const newCategory = this.mapApiResponseToCategory(response.data);
          return newCategory;
        } else {

          throw new Error(response.message || 'Failed to create category');
        }
      }),
      catchError((error: any) => {

        throw error;
      })
    );
  }

  updateCategory(id: string, categoryData: Partial<any>): Observable<any> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found, cannot update category');
      throw new Error('Authentication required');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Prepare the request body
    const requestBody: any = {
      name: categoryData['nameAr'] || categoryData['name'],
      description: categoryData['descriptionAr'] || categoryData['description']
    };
    
    // Only add image if it exists and is not empty
    if (categoryData['image'] && categoryData['image'].trim() !== '') {
      requestBody.image = categoryData['image'];
    }
    
    // Add parent only for subcategories
    if (categoryData['type'] === 'sub' && categoryData['parentId']) {
      requestBody.parent = categoryData['parentId'];
    }



    return this.apiService.put<any>(`/categories/${id}`, requestBody, headers).pipe(
      map((response: any) => {

        if (response.success && response.data) {
          return this.mapApiResponseToCategory(response.data);
        } else {
          throw new Error(response.message || 'Failed to update category');
        }
      }),
      catchError((error: any) => {

        throw error;
      })
    );
  }

  deleteCategory(id: string): Observable<boolean> {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No auth token found, cannot delete category');
      throw new Error('Authentication required');
    }

    const headers = {
      'Authorization': `Bearer ${token}`
    };



    return this.apiService.delete<any>(`/categories/${id}`, headers).pipe(
      map((response: any) => {

        if (response.success) {
          return true;
        } else {
          throw new Error(response.message || 'Failed to delete category');
        }
      }),
      catchError((error: any) => {

        throw error;
      })
    );
  }

  getActiveCategories(): Observable<any[]> {
    return this.getCategories().pipe(
      map((categories: any[]) => categories.filter((c: any) => c.isActive))
    );
  }

  getMainCategories(): Observable<any[]> {
    return this.getCategories().pipe(
      map((categories: any[]) => categories.filter((c: any) => c.type === 'main'))
    );
  }

  getSubCategories(parentId: string): Observable<any[]> {
    return this.getCategories().pipe(
      map((categories: any[]) => categories.filter((c: any) => c.type === 'sub' && c.parentId === parentId))
    );
  }
}
