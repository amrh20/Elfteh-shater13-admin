import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private mockUsers: any[] = [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      firstName: 'مدير',
      lastName: 'النظام',
      role: 'admin',
      isActive: true,
      avatar: '/assets/images/default-user.svg',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date('2024-01-15')
    },
    {
      id: '2',
      username: 'manager',
      email: 'manager@example.com',
      firstName: 'مدير',
      lastName: 'المبيعات',
      role: 'manager',
      isActive: true,
      avatar: '/assets/images/default-user.svg',
      createdAt: new Date('2024-01-02'),
      lastLogin: new Date('2024-01-14')
    }
  ];

  constructor(private apiService: ApiService) { }

  getUsers(): Observable<any[]> {
    return this.apiService.get<any>('/users').pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return this.mockUsers;
      }),
      catchError((error: any) => {
        console.error('Error fetching users from API:', error);
        return of(this.mockUsers).pipe(delay(500));
      })
    );
  }

  getUserById(id: string): Observable<any | undefined> {
    return this.apiService.get<any>(`/users/${id}`).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        return this.mockUsers.find(user => user.id === id);
      }),
      catchError((error: any) => {
        console.error('Error fetching user from API:', error);
        return of(this.mockUsers.find(user => user.id === id)).pipe(delay(300));
      })
    );
  }

  createUser(userData: any): Observable<any> {
    return this.apiService.post<any>('/users', userData).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        // Fallback to mock creation
        const newUser: any = {
          id: Date.now().toString(),
          ...userData,
          createdAt: new Date(),
          isActive: true
        };
        this.mockUsers.push(newUser);
        return newUser;
      }),
      catchError((error: any) => {
        console.error('Error creating user via API:', error);
        // Fallback to mock creation
        const newUser: any = {
          id: Date.now().toString(),
          ...userData,
          createdAt: new Date(),
          isActive: true
        };
        this.mockUsers.push(newUser);
        return of(newUser).pipe(delay(800));
      })
    );
  }

  updateUser(id: string, userData: Partial<any>): Observable<any> {
    return this.apiService.put<any>(`/users/${id}`, userData).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        // Fallback to mock update
        const userIndex = this.mockUsers.findIndex(user => user.id === id);
        if (userIndex !== -1) {
          this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...userData };
          return this.mockUsers[userIndex];
        }
        throw new Error('User not found');
      }),
      catchError((error: any) => {
        console.error('Error updating user via API:', error);
        // Fallback to mock update
        const userIndex = this.mockUsers.findIndex(user => user.id === id);
        if (userIndex !== -1) {
          this.mockUsers[userIndex] = { ...this.mockUsers[userIndex], ...userData };
          return of(this.mockUsers[userIndex]).pipe(delay(800));
        }
        throw new Error('User not found');
      })
    );
  }

  deleteUser(id: string): Observable<boolean> {
    return this.apiService.delete<any>(`/users/${id}`).pipe(
      map((response: any) => {
        if (response && response.success) {
          return true;
        }
        // Fallback to mock deletion
        const userIndex = this.mockUsers.findIndex(user => user.id === id);
        if (userIndex !== -1) {
          this.mockUsers.splice(userIndex, 1);
          return true;
        }
        return false;
      }),
      catchError((error: any) => {
        console.error('Error deleting user via API:', error);
        // Fallback to mock deletion
        const userIndex = this.mockUsers.findIndex(user => user.id === id);
        if (userIndex !== -1) {
          this.mockUsers.splice(userIndex, 1);
          return of(true).pipe(delay(500));
        }
        return of(false).pipe(delay(500));
      })
    );
  }

  uploadAvatar(userId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.apiService.uploadFile<any>(`/users/${userId}/avatar`, file).pipe(
      map((response: any) => {
        if (response && response.data) {
          return response.data;
        }
        // Fallback to mock update
        const user = this.mockUsers.find(u => u.id === userId);
        if (user) {
          user.avatar = URL.createObjectURL(file);
          return user;
        }
        throw new Error('User not found');
      }),
      catchError((error: any) => {
        console.error('Error uploading avatar via API:', error);
        // Fallback to mock update
        const user = this.mockUsers.find(u => u.id === userId);
        if (user) {
          user.avatar = URL.createObjectURL(file);
          return of(user).pipe(delay(500));
        }
        throw new Error('User not found');
      })
    );
  }
}
