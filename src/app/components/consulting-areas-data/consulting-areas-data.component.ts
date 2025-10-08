// src/app/components/consulting-areas-data/consulting-areas-data.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.model';
import { CategoriesService } from '../../services/categories.service';
import { LoadingComponent } from "../../shared/loading/loading.component";

@Component({
  selector: 'app-consulting-areas-data',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './consulting-areas-data.component.html',
  styleUrl: './consulting-areas-data.component.css',
})
export class ConsultingAreasDataComponent implements OnInit {
  services: Category[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(private categoriesService: CategoriesService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (response) => {
        this.services = response?.data?.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.error =
          'حدث خطأ أثناء تحميل البيانات. يرجى المحاولة مرة أخرى لاحقًا.';
        this.isLoading = false;
      },
    });
  }

  retryLoad(): void {
    this.error = null;
    this.isLoading = true;
    this.loadCategories();
  }
}
