import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ExpertConsultationsService {
  private baseUrl = environment.apiBaseUrlConsultant;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'حدث خطأ غير متوقع';

    if (error.status === 401) {
      errorMessage = 'انتهت صلاحية تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      this.router.navigate(['/Auth']);
    } else if (error.status === 403) {
      errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء';
    } else if (error.status === 404) {
      errorMessage = 'البيانات المطلوبة غير موجودة';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }

    this.toastr.error(errorMessage, 'خطأ', {
      timeOut: 5000,
      positionClass: 'toast-top-center',
    });

    console.error('خطأ في الخدمة:', error);
    return throwError(() => error);
  }

  getNewConsultations(): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}consultations_requests`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  getConsultationsByType(type: 'accepted' | 'completed'): Observable<any> {
    return this.http
      .get<any>(`${this.baseUrl}consultations?type=${type}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  acceptConsultation(id: number): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}acceptConsultation`,
        { consultation_id: id },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  rejectConsultation(id: number, reason?: string): Observable<any> {
    return this.http
      .post(
        `${this.baseUrl}reject_Consultation`,
        {
          consultation_id: id,
          ...(reason && { reason }), // إضافة السبب فقط إذا كان موجودًا
        },
        { headers: this.getAuthHeaders() }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  updateConsultationDate(data: {
    consultation_id: number;
    date: string;
    time: string;
  }): Observable<any> {
    return this.http
      .post(`${this.baseUrl}ConsultationUpdateDate`, data, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // دالة جديدة للحصول على تفاصيل استشارة محددة
  getConsultationDetails(id: number): Observable<any> {
    return this.http
      .get(`${this.baseUrl}consultation_details?id=${id}`, {
        headers: this.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }
}
