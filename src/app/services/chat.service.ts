import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private apiUrl = environment.apiBaseUrl;
  private apiConsultUrl = environment.apiBaseUrlConsultant;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  startCall(consultationId: any, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http.post(
      `${baseUrl}chat/startCall`,
      { consultation_id: consultationId },
      { headers: this.getHeaders() }
    );
  }

  storeRate(rateData: any, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http.post(`${baseUrl}store-rate`, rateData, {
      headers: this.getHeaders(),
    });
  }

  chatmessage(id: number, userType: string, page: number = 1): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http.get(`${baseUrl}chat?consultation_id=${id}&page=${page}`, {
      headers: this.getHeaders(),
    });
  }

  sendMessageToChat(payload: any, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http.post(`${baseUrl}chat/send`, payload, {
      headers: this.getHeaders(),
    });
  }

  compeleteConsultation(consultion_id: any, userType: string): Observable<any> {
    const baseUrl = userType === 'user' ? this.apiUrl : this.apiConsultUrl;
    return this.http.post(
      `${baseUrl}complete_Consultation`,
      { consultation_id: consultion_id },
      { headers: this.getHeaders() }
    );
  }
}
