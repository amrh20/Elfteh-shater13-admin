import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  private isRedirecting = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is already logged in
    if (this.authService.isAuthenticated() && !this.isRedirecting) {
      this.isRedirecting = true;
      this.router.navigate(['/dashboard']).then(() => {
        this.isRedirecting = false;
      });
      return;
    }

    // Load saved credentials if remember me was checked
    this.loadSavedCredentials();
  }

  loadSavedCredentials(): void {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedRememberMe = localStorage.getItem('rememberMe');
    
    if (savedUsername && savedRememberMe === 'true') {
      this.username = savedUsername;
      this.rememberMe = true;
    }
  }

  saveCredentials(): void {
    if (this.rememberMe) {
      localStorage.setItem('rememberedUsername', this.username);
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberedUsername');
      localStorage.removeItem('rememberMe');
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'يرجى إدخال اسم المستخدم وكلمة المرور';
      return;
    }

    if (this.isLoading) {
      return; // Prevent multiple submissions
    }

    this.isLoading = true;
    this.errorMessage = '';


    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        
        // Save credentials if remember me is checked
        this.saveCredentials();
        
        // Navigate to dashboard only once
        if (!this.isRedirecting) {
          this.isRedirecting = true;
          this.router.navigate(['/dashboard']).then(() => {
            this.isRedirecting = false;
          }).catch((error) => {
            console.error('Navigation error:', error);
            this.isRedirecting = false;
          });
        }
      },
      error: (error) => {
        this.errorMessage = 'فشل في تسجيل الدخول. يرجى التحقق من بياناتك.';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
