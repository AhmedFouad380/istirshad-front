import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map } from 'rxjs';

interface City {
  id: number;
  title: string;
}

interface CitiesResponse {
  status: number;
  message: string;
  data: {
    data: City[];
  };
}

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  private apiUrl = `${environment.apiBaseUrl}Cities-list`; // تأكد من صحة المسار
  private apiUrl2 = `${environment.apiBaseUrl}areas-list`; // تأكد من صحة المسار

  constructor(private http: HttpClient) {}

getCities(areaId: number): Observable<{ label: string; value: number }[]> {
  return this.http.get<CitiesResponse>(`${this.apiUrl}?area_id=${areaId}`).pipe(
    map((response) => {
      return response.data.data.map((city) => ({
        label: city.title,
        value: city.id,
      }));
    })
  );
}

   getAreas(): Observable<{ label: string; value: number }[]> {
    return this.http.get<CitiesResponse>(this.apiUrl2).pipe(
      map((response) => {
        return response.data.data.map((city) => ({
          label: city.title,
          value: city.id,
        }));
      })
    );

  }
}
