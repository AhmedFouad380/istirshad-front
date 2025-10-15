import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private baseUrl = environment.apiBaseUrl;

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

  // 👑 استدعاء قائمة التقارير
  getReportList(): Observable<any> {
    return this.http
      .get(`${this.baseUrl}report-list`, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // � إرسال شكوى/تقرير
  storeReport(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    });
    // Note: Don't set Content-Type for FormData, browser will set it automatically with boundary
    
    return this.http
      .post(`${this.baseUrl}store-report`, formData, { headers })
      .pipe(catchError(this.handleError.bind(this)));
  }

  // �👿 معالجة الأخطاء
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'حدث خطأ غير متوقع';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `خطأ: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 401:
          errorMessage = 'انتهت صلاحية الجلسة، برجاء تسجيل الدخول من جديد';
          localStorage.removeItem('token');
          this.router.navigate(['/Auth']);
          break;
        case 404:
          errorMessage = 'الرابط غير موجود';
          break;
        case 500:
          errorMessage = 'مشكلة بالخادم، حاول لاحقًا';
          break;
        default:
          errorMessage = error.error?.message || errorMessage;
          break;
      }
    }

    this.toastr.error(errorMessage, 'خطأ', {
      timeOut: 5000,
      positionClass: 'toast-top-center',
    });

    return throwError(() => new Error(errorMessage));
  }
}
