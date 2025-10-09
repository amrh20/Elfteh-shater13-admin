import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export const ApiInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
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
          // Use window.location for navigation to avoid dependency injection issues
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
      }
      
      return throwError(() => error);
    })
  );
};
