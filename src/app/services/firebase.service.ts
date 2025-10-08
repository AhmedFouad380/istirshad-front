import { Injectable } from '@angular/core';
import { messaging, getToken, onMessage } from '../../firebase';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class firebaseService {
  public currentToken: string | null = null;

  // 🧠 هنا هنخزن الإشعار لما يوصلك
  public foregroundNotification$ = new BehaviorSubject<any>(null);

  async requestPermissionAndGetToken(): Promise<string | null> {
    try {
      const token = await getToken(messaging, {
        vapidKey:
          'BOR-jSnDoqDkOIovEFIxhgKLphg-6p_ebxQX1jKqQME-DqDBUaKQhg5eAicqFNi6WOlh624YxAxBWlTK2R9nY8A',
        serviceWorkerRegistration: await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        ),
      });
      if (token) {
        this.currentToken = token;
        console.log('📲 FCM Token:', token);

        return token;
      } else {
        console.warn('No registration token available.');
        return null;
      }
    } catch (error) {
      console.error('Token error: ', error);
      return null;
    }
  }

  listenToMessages() {
    onMessage(messaging, (payload) => {
      console.log('📩 Notification received:', payload);
      const data = payload?.data || {};
      this.foregroundNotification$.next(data); // نخزن الإشعار مؤقتًا
    });
  }
}
