import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsultationsService {
  private apiUrl = environment.apiBaseUrl;
  private apiConsultUrl = environment.apiBaseUrlConsultant;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  // إنشاء استشارة جديدة
  storeConsultation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}store-consultation`, data, {
      headers: this.getHeaders(),
    });
  }

  // الحصول على الاستشارات حسب النوع
  getConsultationsByType(
    type: 'pending' | 'accepted' | 'completed'
  ): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}consultations?type=${type}`, {
      headers: this.getHeaders(),
    });
  }

  // قبول الاستشارة
  acceptConsultation(consultationId: number): Observable<any> {
    return this.http.post(
      `${this.apiConsultUrl}accept-consultation`,
      { consultation_id: consultationId },
      { headers: this.getHeaders() }
    );
  }

  // رفض الاستشارة
  rejectConsultation(consultationId: number, reason?: string): Observable<any> {
    return this.http.post(
      `${this.apiConsultUrl}reject-consultation`,
      { consultation_id: consultationId, reason },
      { headers: this.getHeaders() }
    );
  }
}
