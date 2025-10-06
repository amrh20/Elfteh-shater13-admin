import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  username: string = '';
  email: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.username || !this.email || !this.password) {
      this.errorMessage = 'يرجى إدخال اسم المستخدم والبريد وكلمة المرور';
      return;
    }

    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.registerAdmin({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.successMessage = 'تم إنشاء حساب المشرف بنجاح';
        // Optional: redirect to login after short delay
        setTimeout(() => this.router.navigate(['/login']), 1000);
      },
      error: (err) => {
        console.error('Register error:', err);
        this.errorMessage = 'فشل في إنشاء الحساب. يرجى المحاولة مرة أخرى';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}


