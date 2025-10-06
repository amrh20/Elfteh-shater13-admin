import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const ApiInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  
  // Clone the request and add the base URL if it's a relative URL
  let apiReq = request;
  
  if (!request.url.startsWith('http')) {
    apiReq = request.clone({
      url: `${environment.apiBaseUrl}${request.url}`
    });
  }

  // Add common headers
  apiReq = apiReq.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    apiReq = apiReq.clone({
      setHeaders: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  return next(apiReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle common errors
      if (error.status === 401) {
        // Do not auto-redirect for auth endpoints so components can show error messages
        const url = apiReq.url || '';
        const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/create-admin');

        if (!isAuthEndpoint) {
          localStorage.removeItem('authToken');
          // Use SPA navigation to avoid full page reload
          if (router.url !== '/login') {
            router.navigateByUrl('/login');
          }
        }
      }
      
      return throwError(() => error);
    })
  );
};
