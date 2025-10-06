import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  constructor(private apiService: ApiService) { }

  getOrders(): Observable<any[]> {
    return this.apiService.get<any>('/orders').pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        } else if (response && Array.isArray(response)) {
          return response;
        } else {
          return [];
        }
      }),
      catchError((error: any) => {
        return of([]).pipe(delay(500));
      })
    );
  }

  /**
   * Get orders with filters and pagination
   * @param filters - Filter parameters
   * @returns Observable with filtered orders
   */
  getOrdersWithFilters(filters: any): Observable<any> {
    // Prepare query parameters based on API documentation
    const params: any = {};
    
    // Pagination
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    
    // Status filter
    if (filters.status && filters.status !== '') params.status = filters.status;
    
    // Search filter
    if (filters.search && filters.search.trim() !== '') params.search = filters.search;
    
    // Date filters
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    
    // Sort
    if (filters.sort) params.sort = filters.sort;
    
    return this.apiService.get<any>('/orders', params).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response;
        } else if (response && Array.isArray(response)) {
          return { data: response, total: response.length, page: 1, limit: response.length };
        } else {
          return { data: [], total: 0, page: 1, limit: 0 };
        }
      }),
      catchError((error: any) => {
        return of({ 
          data: [], 
          total: 0, 
          page: 1, 
          limit: 0 
        }).pipe(delay(500));
      })
    );
  }

  getOrder(id: string): Observable<any | undefined> {
    return this.apiService.get<any>(`/orders/${id}`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        } else if (response) {
          return response;
        } else {
          return undefined;
        }
      }),
      catchError((error: any) => {
        return of(undefined).pipe(delay(300));
      })
    );
  }

  updateOrderStatus(orderId: string, status: string): Observable<boolean> {
    // Call the actual API to update order status
    const requestBody = { status };
    
    return this.apiService.patch<any>(`/orders/${orderId}/status`, requestBody).pipe(
      map((response: any) => {
        // Check if the update was successful
        if (response && response.success !== false) {
          return true;
        } else {
          return false;
        }
      }),
      catchError((error: any) => {
        console.error('Error updating order status:', error);
        return of(false);
      })
    );
  }

  updatePaymentStatus(orderId: string, paymentStatus: string): Observable<boolean> {
    // Call the actual API to update payment status
    const requestBody = { paymentStatus };
    
    return this.apiService.patch<any>(`/orders/${orderId}/payment`, requestBody).pipe(
      map((response: any) => {
        // Check if the update was successful
        if (response && response.success !== false) {
          return true;
        } else {
          return false;
        }
      }),
      catchError((error: any) => {
        console.error('Error updating payment status:', error);
        return of(false);
      })
    );
  }
}
