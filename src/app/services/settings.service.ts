import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface SettingsData {
  title: string;
  short_description: string;
  logo: string;
  favicon: string;
  address: string;
  email: string;
  phone: string;
  youtube: string;
  twitter: string;
  instagram: string;
  android_link: string;
  ios_link: string;
  categories:any
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly settingsUrl = `${environment.apiBaseUrl}setting`;

  private settingsSubject = new BehaviorSubject<SettingsData | null>(null);
  public settings$ = this.settingsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // يتم استدعاؤه مرة واحدة فقط (مثلاً في AppComponent)
  loadSettings(): Observable<any> {
    return this.http
      .get<{ data: SettingsData }>(this.settingsUrl)
      .pipe(tap((res) => this.settingsSubject.next(res.data)));
  }

  // getter sync (في حال احتجت القيمة فورًا)
  get currentSettings(): SettingsData | null {
    return this.settingsSubject.value;
  }
}
