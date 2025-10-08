import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  public messages$ = new BehaviorSubject<any[]>([]);
  public currentFCMToken = '';

  constructor(private http: HttpClient) {}

  getNotificationsData(): Observable<any> {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isUser = user?.type === 'user';

    const baseUrl = isUser
      ? environment.apiBaseUrl
      : environment.apiBaseUrlConsultant;

    return this.http.get(`${baseUrl}notifications`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}
