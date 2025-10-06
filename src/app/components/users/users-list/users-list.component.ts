import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../../services/users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  users: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private usersService: UsersService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    console.log('🔄 بدء تحميل المستخدمين من الـ API...');
    
    this.usersService.getUsers().subscribe({
      next: (response) => {
        console.log('✅ استجابة API للمستخدمين:', response);
        console.log('📊 نوع البيانات:', typeof response);
        console.log('📋 عدد المستخدمين:', response?.length || 0);
        
        if (Array.isArray(response)) {
          console.log('🎯 البيانات عبارة عن array');
          response.forEach((user, index) => {
            console.log(`👤 المستخدم ${index + 1}:`, user);
            console.log(`   - ID: ${user.id || user._id}`);
            console.log(`   - Name: ${user.name || user.firstName + ' ' + user.lastName || user.username}`);
            console.log(`   - Email: ${user.email}`);
            console.log(`   - Role: ${user.role}`);
            console.log(`   - Active: ${user.isActive}`);
            console.log(`   - Created: ${user.createdAt}`);
            console.log('   - كامل البيانات:', user);
          });
        } else {
          console.log('⚠️ البيانات ليست array:', response);
        }
        
        this.users = response || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ خطأ في تحميل المستخدمين:', error);
        console.error('📄 تفاصيل الخطأ:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          error: error.error
        });
        
        this.error = 'حدث خطأ في تحميل المستخدمين';
        this.isLoading = false;
        
        // استخدام البيانات التجريبية في حالة الخطأ
        this.users = [
          {
            id: '1',
            name: 'أحمد محمد',
            email: 'ahmed@example.com',
            role: 'user',
            isActive: true,
            createdAt: new Date('2024-01-15')
          },
          {
            id: '2',
            name: 'فاطمة علي',
            email: 'fatima@example.com',
            role: 'admin',
            isActive: true,
            createdAt: new Date('2024-02-20')
          }
        ];
      }
    });
  }

}
