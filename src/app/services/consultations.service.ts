import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ConsultationsService {
  private apiUrl = environment.apiBaseUrl;
  private apiConsultUrl = environment.apiBaseUrlConsultant;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

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
    return this.http
      .post(`${this.apiUrl}store-consultation`, data, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // الحصول على الاستشارات حسب النوع
  getConsultationsByType(
    type: 'pending' | 'accepted' | 'completed'
  ): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}consultations?type=${type}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // قبول الاستشارة
  acceptConsultation(consultationId: number): Observable<any> {
    return this.http
      .post(
        `${this.apiConsultUrl}accept-consultation`,
        { consultation_id: consultationId },
        { headers: this.getHeaders() }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  // رفض الاستشارة
  rejectConsultation(consultationId: number, reason?: string): Observable<any> {
    return this.http
      .post(
        `${this.apiConsultUrl}reject-consultation`,
        { consultation_id: consultationId, reason },
        { headers: this.getHeaders() }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  // معالجة الأخطاء
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';
    let showToast = true;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage =
            'انتهت صلاحية تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى';
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/Auth']);
          break;
        case 403:
          errorMessage = 'ليس لديك صلاحية للقيام بهذا الإجراء';
          break;
        case 404:
          errorMessage = 'البيانات المطلوبة غير موجودة';
          break;
        case 422:
          errorMessage = 'بيانات غير صالحة، يرجى التحقق من المدخلات';
          if (error.error?.errors) {
            errorMessage += ': ' + Object.values(error.error.errors).join(', ');
          }
          break;
        case 500:
          errorMessage = 'خطأ في الخادم الداخلي';
          break;
        default:
          if (error.error?.message) {
            errorMessage = error.error.message;
          }
          break;
      }
    }

    if (showToast) {
      this.toastr.error(errorMessage, 'خطأ', {
        timeOut: 5000,
        positionClass: 'toast-top-center',
      });
    }

    console.error('خطأ في الخدمة:', error);
    return throwError(() => ({
      message: errorMessage,
      originalError: error,
    }));
  }
}
