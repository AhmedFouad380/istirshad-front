// src/app/services/categories.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategoriesResponse, CategoryDetailsResponse } from '../models/category.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  // Changed to PascalCase
  private readonly categoriesUrl = `${environment.apiBaseUrl}categories-list`;
  private readonly categoryDetailsUrl = `${environment.apiBaseUrl}category`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<CategoriesResponse> {
    return this.http.get<CategoriesResponse>(this.categoriesUrl);
  }
  getCategoryDetails(id: number): Observable<CategoryDetailsResponse> {
    return this.http.get<CategoryDetailsResponse>(
      `${this.categoryDetailsUrl}?category_id=${id}`
    );
  }
}
