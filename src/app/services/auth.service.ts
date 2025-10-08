import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { firebaseService } from './firebase.service';
import { NotificationService } from './Notification.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem('token')
  );
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private userSubject = new BehaviorSubject<any>(
    this.getUserFromLocalStorage()
  );
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private firebaseService: firebaseService,
    private notificationService: NotificationService // 👈 ضيف دي
  ) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  private getBaseUrl(type: string): string {
    return type === 'expert'
      ? environment.apiBaseUrlConsultant
      : environment.apiBaseUrl;
  }
  sendFcmTokenToServer(fcmToken: string, type: string): Observable<any> {
    return this.http.post(
      `${this.getBaseUrl(type)}auth/save-fcm-token`,
      { fcm_token: fcmToken },
      this.getHeaders()
    );
  }

  private getUserFromLocalStorage(): any {
    const data = localStorage.getItem('user');
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  storeToken(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.isLoggedInSubject.next(true);
    this.userSubject.next(user);
    this.notificationService.getNotificationsData().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.notificationService.messages$.next(res.data.data);
        }
      },
      error: (err) => {
        console.error('Failed to fetch notifications after login', err);
      },
    });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  forceRefresh(): void {
    const tokenExists = !!localStorage.getItem('token');
    this.isLoggedInSubject.next(tokenExists);
    this.updateUserFromLocalStorage();
  }

  updateUserFromLocalStorage(): void {
    const updatedUser = this.getUserFromLocalStorage();
    this.userSubject.next(updatedUser);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
    this.userSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  checkRedirect(): void {
    const redirectUrl = localStorage.getItem('redirectUrl');
    if (redirectUrl) {
      localStorage.removeItem('redirectUrl');
      this.router.navigateByUrl(redirectUrl);
    } else {
      this.router.navigate(['/']);
    }
  }

  register(userData: any, type: string): Observable<any> {
    return new Observable((observer) => {
      this.firebaseService
        .requestPermissionAndGetToken()
        .then((fcmToken) => {
          let finalPayload: any;

          if (userData instanceof FormData) {
            userData.append('fcm_token', fcmToken || '');
            finalPayload = userData;
          } else {
            finalPayload = {
              ...userData,
              fcm_token: fcmToken || '',
            };
          }

          this.http
            .post(`${this.getBaseUrl(type)}auth/register`, finalPayload)
            .subscribe({
              next: (res: any) => {
                if (res?.data?.token && res?.data?.user) {
                  this.storeToken(res.data.token, res.data.user);
                }
                observer.next(res);
              },
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });
        })
        .catch((error) => observer.error(error));
    });
  }

  sendOtp(phone: string, type: string): Observable<any> {
    return this.http.post(`${this.getBaseUrl(type)}auth/send-otp`, { phone });
  }

  verifyOtpWithFcm(phone: string, otp: string, type: string): Observable<any> {
    return new Observable((observer) => {
      this.firebaseService
        .requestPermissionAndGetToken()
        .then((fcmToken) => {
          this.http
            .post(`${this.getBaseUrl(type)}auth/verify-otp`, {
              phone,
              otp,
              fcm_token: fcmToken,
            })
            .subscribe({
              next: (res) => observer.next(res),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });
        })
        .catch((error) => observer.error(error));
    });
  }

  getProfile(type: string): Observable<any> {
    return this.http.get(`${this.getBaseUrl(type)}auth/me`, this.getHeaders());
  }

  updateProfile(userData: any, type: string): Observable<any> {
    return this.http.post(
      `${this.getBaseUrl(type)}auth/updateProfile`,
      userData,
      this.getHeaders()
    );
  }
}
