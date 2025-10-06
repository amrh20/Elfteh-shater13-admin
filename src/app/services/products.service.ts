import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private mockProducts: any[] = [
    {
      _id: '1',
      name: 'Dishwashing Liquid',
      description: 'Effective dishwashing liquid that easily removes grease and protects your hands',
      price: 25.99,
      stock: 50,
      category: {
        _id: 'cleaners',
        name: 'Cleaners'
      },
      images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center'],
      productType: 'featured',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '2',
      name: 'Lavender Floor Cleaner',
      description: 'High-quality floor cleaner with a refreshing lavender scent, suitable for all types of floors',
      price: 45.99,
      stock: 30,
      category: {
        _id: 'cleaners',
        name: 'Cleaners'
      },
      images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop&crop=center'],
      productType: 'bestSeller',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '3',
      name: 'Wireless Headphones',
      description: 'High-quality wireless headphones with noise cancellation',
      price: 89.99,
      stock: 20,
      category: {
        _id: 'electronics',
        name: 'Electronics'
      },
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop&crop=center'],
      productType: 'normal',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '4',
      name: 'Garden Tools Set',
      description: 'Complete set of essential garden tools for home gardening',
      price: 29.99,
      stock: 45,
      category: {
        _id: 'home-garden',
        name: 'Home & Garden'
      },
      images: ['https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop&crop=center'],
      productType: 'normal',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '5',
      name: 'Programming Book',
      description: 'Comprehensive guide to modern programming techniques',
      price: 19.99,
      stock: 80,
      category: {
        _id: 'books',
        name: 'Books'
      },
      images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop&crop=center'],
      productType: 'normal',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '6',
      name: 'Denim Jeans',
      description: 'Premium quality denim jeans with perfect fit',
      price: 79.99,
      stock: 60,
      category: {
        _id: 'clothing',
        name: 'Clothing'
      },
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop&crop=center'],
      productType: 'featured',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '7',
      name: 'Winter Jacket',
      description: 'Warm and stylish winter jacket for cold weather',
      price: 129.99,
      stock: 30,
      category: {
        _id: 'clothing',
        name: 'Clothing'
      },
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop&crop=center'],
      productType: 'specialOffer',
      discount: 20,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    },
    {
      _id: '8',
      name: 'Kitchen Blender',
      description: 'Professional kitchen blender for smoothies and food processing',
      price: 59.99,
      stock: 40,
      category: {
        _id: 'home-garden',
        name: 'Home & Garden'
      },
      images: ['https://images.unsplash.com/photo-1570222094114-d054a8173cdb?w=400&h=300&fit=crop&crop=center'],
      productType: 'normal',
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z'
    }
  ];

  constructor(private apiService: ApiService) { }

  getProducts(page: number = 1, limit: number = 20, filters?: any): Observable<any> {
    const params: any = { page, limit };
    
    // Add filters to params
    if (filters) {
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
        console.log('🔍 Adding search to API call:', params.search);
      }
      if (filters.subcategory) params.subcategory = filters.subcategory;
      if (filters.productType) params.productType = filters.productType;
    }
    
    console.log('📡 API call params:', params);
    return this.apiService.get<any>('/products/admin', params);
  }

  getProduct(id: string): Observable<any | undefined> {
    // First try to get from API
    return this.apiService.get<any>(`/products/${id}`).pipe(
      catchError((error) => {
        console.warn('API failed, falling back to mock data:', error);
        
        // Return mock data as fallback
        const mockProduct = this.mockProducts.find(p => p._id === id);
        if (mockProduct) {
          console.log('Returning mock product:', mockProduct);
          return of(mockProduct);
        } else {
          console.error('Product not found in mock data');
          return of(null);
        }
      })
    );
  }

  createProduct(productData: any): Observable<any> {
    return this.apiService.post('/products', productData);
  }

  updateProduct(id: string, productData: Partial<any>): Observable<any> {
    return this.apiService.put(`/products/${id}`, productData);
  }

  deleteProduct(id: string): Observable<any> {
    return this.apiService.delete(`/products/${id}`);
  }



  getFeaturedProducts(): Observable<any[]> {
    const featured = this.mockProducts.filter((p: any) => p.featured);
    return of(featured).pipe(delay(300));
  }

  getBestSellers(): Observable<any[]> {
    // Since isBestSeller no longer exists, return empty array or implement new logic
    return of([]).pipe(delay(300));
  }

  getOnSaleProducts(): Observable<any[]> {
    // Since isOnSale no longer exists, return empty array or implement new logic
    return of([]).pipe(delay(300));
  }

  getProductsBySubcategory(subcategoryId: string, page: number = 1, limit: number = 12, filters?: any): Observable<any> {
    // Build query parameters
    const params: any = { page, limit };
    
    if (filters) {
      if (filters.search && filters.search.trim()) {
        params.search = filters.search.trim();
        console.log('🔍 Adding search to subcategory API call:', params.search);
      }
      if (filters.subcategory) params.subcategory = filters.subcategory;
      if (filters.productType) params.productType = filters.productType;
    }
    
    console.log('📡 Subcategory API call params:', params);
    return this.apiService.get<any>(`/products/subcategory/${subcategoryId}`, params);
  }
}
