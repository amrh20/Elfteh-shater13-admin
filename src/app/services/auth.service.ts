import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'super-admin';
  avatar?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  admin: AdminUser;
  token: string;
}

export interface RegisterAdminRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterAdminResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    try {
      // Check if user is logged in from localStorage
      const savedUser = localStorage.getItem('adminUser');
      const savedToken = localStorage.getItem('authToken');
      if (savedUser && savedToken) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error initializing AuthService:', error);
      // Clear corrupted data
      localStorage.removeItem('adminUser');
      localStorage.removeItem('authToken');
    }
  }

  login(username: string, password: string): Observable<AdminUser> {
    const loginData: LoginRequest = {
      username,
      password
    };

    return this.apiService.post<LoginResponse>('/auth/login', loginData).pipe(
      map((response: LoginResponse) => {
        console.log('Login response received:', response);
        
        // The API returns the response directly
        if (response.success && response.admin && response.token) {
          // Store the token
          localStorage.setItem('authToken', response.token);
          
          // Store user data and update current user subject
          this.setCurrentUser(response.admin);
          
          // Return the user data from the admin field
          return response.admin;
        } else {
          console.error('Login failed - invalid response structure:', response);
          throw new Error('Login failed - invalid response structure');
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('authToken');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    try {
      // Check both localStorage and currentUserSubject
      const hasToken = !!localStorage.getItem('authToken');
      const hasUser = !!localStorage.getItem('adminUser');
      const currentUser = this.currentUserSubject.value;
      
      const isAuth = hasToken && hasUser && currentUser !== null;
      
      console.log('isAuthenticated check:', {
        hasToken,
        hasUser,
        currentUser: !!currentUser,
        isAuth
      });
      
      return isAuth;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  getCurrentUser(): AdminUser | null {
    try {
      return this.currentUserSubject.value;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  setCurrentUser(user: AdminUser): void {
    console.log('Setting current user:', user);
    localStorage.setItem('adminUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  registerAdmin(payload: RegisterAdminRequest) {
    return this.apiService.post<RegisterAdminResponse>('/auth/create-admin', payload);
  }
}
