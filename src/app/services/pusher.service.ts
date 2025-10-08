import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
// فوق في الاستيرادات

@Injectable({
  providedIn: 'root',
})
export class PusherService {
  private pusher: Pusher;
  public channel: any;
  public connectionState = new BehaviorSubject<string>('disconnected');

  constructor() {
    this.pusher = new Pusher('ab784e6ee42989dd21c3', {
      cluster: 'eu',
      forceTLS: true,
    });

    this.pusher.connection.bind('state_change', (states: any) => {
      this.connectionState.next(states.current);
    });

    this.pusher.connection.bind('error', (err: any) => {
      console.error('Pusher error:', err);
    });
  }

  subscribe(channelName: string) {
    this.channel = this.pusher.subscribe(channelName);
    return this.channel;
  }

  unsubscribe(channelName: string) {
    this.pusher.unsubscribe(channelName);
  }

  disconnect() {
    this.pusher.disconnect();
  }

  // ✅ أضف دي: إرسال إشارة المكالمة للطرف التاني
  sendCallSignal(data: {
    roomID: string;
    callerID: string;
    callerName: string;
    toUserID: number;
  }) {
    // استخدم هنا API من عندك أو WebSocket إن وجد
    // أو مؤقتًا: تخزين البيانات في localStorage فقط للتجربة
    const event = {
      event: 'IncomingCallEvent',
      data,
    };

    // ده مثال فقط - لازم تستبدله بـ backend API حقيقي
    console.warn('🔔 Call Signal Sent (mocked):', event);
  }

  // ✅ أضف دي: تسجيل event يدويًا
  on(eventName: string, callback: (data: any) => void) {
    if (this.channel) {
      this.channel.bind(eventName, callback);
    } else {
      console.warn('Channel not initialized yet.');
    }
  }
}
