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
export class ChatService {
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
    });
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      // عرض رسالة Toast
      this.toastr.error(
        'انتهت صلاحية تسجيل الدخول، برجاء تسجيل الدخول مرة أخرى',
        'خطأ في المصادقة'
      );

      // حذف التوكن من localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // إعادة التوجيه إلى صفحة تسجيل الدخول
      this.router.navigate(['/Auth']);
    }
    return throwError(() => error);
  }
  startCall(consultationId: any, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;

    return this.http
      .post(
        `${baseUrl}chat/startCall`,
        { consultation_id: consultationId },
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }
  storeRate(rateData: any, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http
      .post(`${baseUrl}store-rate`, rateData, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }
  chatmessage(id: number, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http
      .get(`${baseUrl}chat?consultation_id=${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  sendMessageToChat(payload: any, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http
      .post(`${baseUrl}chat/send`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(catchError(this.handleError.bind(this)));
  }

  compeleteConsultation(consultion_id: any, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http
      .post(
        `${baseUrl}complete_Consultation`,
        { consultation_id: consultion_id },
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }
}
