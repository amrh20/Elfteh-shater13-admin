import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /**
   * GET request
   * @param endpoint - API endpoint (without base URL)
   * @param params - Query parameters
   * @param headers - Additional headers
   */
  get<T>(endpoint: string, params?: any, headers?: any): Observable<T> {
    
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }

    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }

    return this.http.get<T>(`${this.baseUrl}${endpoint}`, {
      params: httpParams,
      headers: httpHeaders
    });
  }

  /**
   * POST request
   * @param endpoint - API endpoint (without base URL)
   * @param data - Request body
   * @param headers - Additional headers
   */
  post<T>(endpoint: string, data: any, headers?: any): Observable<T> {
    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: httpHeaders
    });
  }

  /**
   * PUT request
   * @param endpoint - API endpoint (without base URL)
   * @param data - Request body
   * @param headers - Additional headers
   */
  put<T>(endpoint: string, data: any, headers?: any): Observable<T> {
    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }

    return this.http.put<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: httpHeaders
    });
  }

  /**
   * PATCH request
   * @param endpoint - API endpoint (without base URL)
   * @param data - Request body
   * @param headers - Additional headers
   */
  patch<T>(endpoint: string, data: any, headers?: any): Observable<T> {
    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }

    return this.http.patch<T>(`${this.baseUrl}${endpoint}`, data, {
      headers: httpHeaders
    });
  }

  /**
   * DELETE request
   * @param endpoint - API endpoint (without base URL)
   * @param headers - Additional headers
   */
  delete<T>(endpoint: string, headers?: any): Observable<T> {
    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }

    return this.http.delete<T>(`${this.baseUrl}${endpoint}`, {
      headers: httpHeaders
    });
  }

  /**
   * File upload
   * @param endpoint - API endpoint (without base URL)
   * @param file - File to upload
   * @param additionalData - Additional form data
   * @param headers - Additional headers
   */
  uploadFile<T>(endpoint: string, file: File, additionalData?: any, headers?: any): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, {
      headers: httpHeaders
    });
  }

  /**
   * Multiple files upload
   * @param endpoint - API endpoint (without base URL)
   * @param files - Array of files to upload
   * @param additionalData - Additional form data
   * @param headers - Additional headers
   */
  uploadMultipleFiles<T>(endpoint: string, files: File[], additionalData?: any, headers?: any): Observable<T> {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    let httpHeaders = new HttpHeaders();
    if (headers) {
      Object.keys(headers).forEach(key => {
        httpHeaders = httpHeaders.set(key, headers[key]);
      });
    }

    return this.http.post<T>(`${this.baseUrl}${endpoint}`, formData, {
      headers: httpHeaders
    });
  }
}
