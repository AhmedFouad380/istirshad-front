import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  // Set your endpoint URL here
  endpointUrl = '';

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    // Update this to match your API contract
    return this.http.post(this.endpointUrl, { message });
  }
}
