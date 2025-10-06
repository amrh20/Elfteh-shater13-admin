import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Coupon {
  _id?: string;
  code: string;
  discount: number;
  expiresAt: string;
  // Additional fields that might be returned from API
  discountType?: 'percentage' | 'fixed';
  minOrderAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  isActive?: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CouponsResponse {
  coupons: Coupon[];
  total: number;
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CouponsService {

  constructor(private apiService: ApiService) { }

  // Get all coupons with pagination and filters
  getCoupons(params: any = {}): Observable<CouponsResponse> {
    return this.apiService.get<CouponsResponse>('/discount-codes');
  }

  // Get single coupon by ID
  getCoupon(id: string): Observable<any> {
    return this.apiService.get<any>(`/discount-codes/${id}`);
  }

  // Create new coupon
  createCoupon(coupon: Partial<Coupon>): Observable<Coupon> {
    return this.apiService.post<Coupon>('/discount-codes', coupon);
  }

  // Update existing coupon
  updateCoupon(id: string, coupon: Partial<Coupon>): Observable<Coupon> {
    return this.apiService.put<Coupon>(`/discount-codes/${id}`, coupon);
  }

  // Delete coupon
  deleteCoupon(id: string): Observable<any> {
    return this.apiService.delete(`/discount-codes/${id}`);
  }

  // Toggle coupon active status
  toggleCouponStatus(id: string, isActive: boolean): Observable<Coupon> {
    return this.apiService.patch<Coupon>(`/discount-codes/${id}`, { isActive });
  }
}
