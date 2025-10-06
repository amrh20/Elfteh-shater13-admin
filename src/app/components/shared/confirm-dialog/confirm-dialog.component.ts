import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div *ngIf="isOpen" 
         class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
         (click)="onBackdropClick($event)">
      
      <!-- Dialog -->
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all border border-gray-200"
           (click)="$event.stopPropagation()">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div class="flex items-center space-x-3">
            <!-- Icon based on type -->
            <div [class]="getIconClasses() + ' icon-danger'" class="w-10 h-10 rounded-full flex items-center justify-center shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <ng-container [ngSwitch]="data?.type">
                  <path *ngSwitchCase="'danger'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  <path *ngSwitchCase="'warning'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  <path *ngSwitchDefault stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </ng-container>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-900">{{ data?.title || 'تأكيد' }}</h3>
          </div>
          
          <!-- Close button -->
          <button
            (click)="onCancel()"
            class="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-all duration-200 btn-hover"
            title="إغلاق"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Content -->
        <div class="p-6 bg-white">
          <p class="text-gray-700 leading-relaxed text-base whitespace-pre-line">{{ data?.message }}</p>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            (click)="onCancel()"
            class="px-6 py-3 text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md btn-hover"
          >
            {{ data?.cancelText || 'إلغاء' }}
          </button>
          
          <button
            (click)="onConfirm()"
            [class]="getConfirmButtonClasses()"
            class="px-6 py-3 rounded-lg transition-all duration-200 font-medium shadow-sm hover:shadow-md transform hover:scale-105 btn-hover"
          >
            {{ data?.confirmText || 'تأكيد' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transform {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Dialog entrance animation */
    .dialog-enter {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    
    .dialog-enter-active {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
    
    /* Backdrop animation */
    .backdrop-enter {
      opacity: 0;
    }
    
    .backdrop-enter-active {
      opacity: 1;
      transition: opacity 0.3s ease;
    }
    
    /* Button hover effects */
    .btn-hover {
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .btn-hover:hover {
      transform: translateY(-1px);
    }
    
    /* Icon pulse animation for danger type */
    .icon-danger {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }
    
    /* Responsive adjustments */
    @media (max-width: 640px) {
      .max-w-md {
        max-width: calc(100vw - 2rem);
        margin: 0 1rem;
      }
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() isOpen: boolean = false;
  @Input() data: ConfirmDialogData | null = null;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  getIconClasses(): string {
    switch (this.data?.type) {
      case 'danger':
        return 'bg-red-100 text-red-600';
      case 'warning':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  }

  getConfirmButtonClasses(): string {
    switch (this.data?.type) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  }
}
