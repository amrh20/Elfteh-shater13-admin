import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './components/shared/sidebar/sidebar.component';
import { HeaderComponent } from './components/shared/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'admin-dashboard';
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // Listen for mobile menu toggle events with debouncing
    let lastToggleTime = 0;
    window.addEventListener('toggleMobileMenu', (event: any) => {
      const now = Date.now();
      // Prevent rapid toggles (debounce)
      if (now - lastToggleTime < 200) return;
      lastToggleTime = now;
      
      this.toggleMobileSidebar();
    });
  }

  toggleMobileSidebar(): void {
    // This will be handled by the sidebar component
    const event = new CustomEvent('toggleSidebar');
    window.dispatchEvent(event);
  }
  
  get currentUser$() {
    return this.authService.currentUser$;
  }
}
