// src/app/services/consultant.service.ts
import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export interface ConsultantProfileResponse {
  status: number;
  message: string;
  data: {
    consultant: {
      id: number;
      first_name: string;
      middle_name: string;
      last_name: string;
      name: string;
      description: string;
      image: string;
      type: string;
      email: string;
      phone: string;
      rate: number;
      is_active: boolean;
      consultations_count: number;
      categories: {
        id: number;
        title: string;
        description: string;
        image: string;
        consultant_count: number;
      }[];
      created_at: string;
    };
    consultant_categories: {
      data: any[];
    };
    consultant_rates: {
      data: any[];
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class ConsultantService {
  private readonly consultantUrl = `${environment.apiBaseUrlConsultant}`;
  private readonly userUrl = `${environment.apiBaseUrl}`;

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
      this.toastr.error(
        'انتهت صلاحية تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى',
        'خطأ في المصادقة'
      );
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/Auth']);
    } else if (error.status === 404) {
      this.toastr.error('البيانات المطلوبة غير موجودة', 'خطأ');
    } else {
      this.toastr.error('حدث خطأ غير متوقع', 'خطأ');
    }
    return throwError(() => error);
  }

  getConsultantProfile(id: number): Observable<ConsultantProfileResponse> {
    return this.http
      .get<ConsultantProfileResponse>(
        `${this.userUrl}consultant-profile?consultant_id=${id}`,
        { headers: this.getHeaders() }
      )
      .pipe(catchError(this.handleError.bind(this)));
  }

  getConsultationDetails(id: string): Observable<any> {
    const userDataString = localStorage.getItem('user');
    let userType: any = null;

    if (userDataString) {
      try {
        userType = JSON.parse(userDataString);
      } catch (e) {
        console.error('فشل في قراءة user من localStorage', e);
        this.toastr.error('خطأ في بيانات المستخدم', 'خطأ');
        return throwError(() => new Error('Invalid user data'));
      }
    } else {
      this.toastr.error('يجب تسجيل الدخول أولاً', 'خطأ');
      this.router.navigate(['/login']);
      return throwError(() => new Error('User not logged in'));
    }

    const url =
      userType?.type === 'user'
        ? `${this.userUrl}consultation-details?consultation_id=${id}`
        : `${this.consultantUrl}consultation-details?consultation_id=${id}`;

    return this.http
      .get(url, { headers: this.getHeaders() })
      .pipe(catchError(this.handleError.bind(this)));
  }
}
