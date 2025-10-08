// src/app/services/categories.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FAQItem {
  id: number;
  title: string;
  description: string;
}

export interface FAQResponse {
  status: number;
  message: string;
  data: {
    data: FAQItem[];
    links: {
      first: string;
      last: string;
      prev: string | null;
      next: string | null;
    };
    meta: any;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FQAService {
  private readonly FQAUrl = `${environment.apiBaseUrl}faq`;

  constructor(private http: HttpClient) {}

  getFQA(): Observable<FAQResponse> {
    return this.http.get<FAQResponse>(this.FQAUrl);
  }
}
