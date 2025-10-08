// about.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AboutService {

  constructor(private http: HttpClient) {}

  getAboutData(): Observable<any> {
    return this.http.get(`${environment.apiBaseUrl}front/about`);
  }
}
