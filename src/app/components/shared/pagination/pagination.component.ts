import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
  limit: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() pagination: PaginationInfo | null = null;
  @Input() showInfo: boolean = true;
  @Input() infoText: string = 'عنصر';
  @Input() maxVisiblePages: number = 5;
  
  @Output() pageChange = new EventEmitter<number>();

  // Make Math available in template
  Math = Math;

  get currentPage(): number {
    return this.pagination?.current || 1;
  }

  get totalPages(): number {
    return this.pagination?.pages || 1;
  }

  get totalItems(): number {
    return this.pagination?.total || 0;
  }

  get pageSize(): number {
    return this.pagination?.limit || 20;
  }

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get hasPagination(): boolean {
    const hasPagination = this.pagination !== null && this.totalPages > 1;
    return hasPagination;
  }

  get pageNumbers(): number[] {
    if (!this.hasPagination) return [];

    const pages: number[] = [];
    const maxVisiblePages = this.maxVisiblePages;
    
    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      // Adjust start if end is at the limit
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPreviousPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(this.currentPage - 1);
    }
  }

  onNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.currentPage + 1);
    }
  }

  onFirstPage(): void {
    if (this.currentPage > 1) {
      this.onPageChange(1);
    }
  }

  onLastPage(): void {
    if (this.currentPage < this.totalPages) {
      this.onPageChange(this.totalPages);
    }
  }

  canGoToPrevious(): boolean {
    return this.currentPage > 1;
  }

  canGoToNext(): boolean {
    return this.currentPage < this.totalPages;
  }

  canGoToFirst(): boolean {
    return this.currentPage > 1;
  }

  canGoToLast(): boolean {
    return this.currentPage < this.totalPages;
  }
}
