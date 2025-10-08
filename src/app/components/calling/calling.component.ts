import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

@Component({
  selector: 'app-calling',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calling.component.html',
  styleUrls: ['./calling.component.css'],
})
export class CallingComponent implements AfterViewInit, OnDestroy {
  @ViewChild('root') root!: ElementRef;

  roomID!: string;
  userID!: string;
  userName!: string;
  isLoading = true;
  private isJoined = false;
  private zpInstance: any = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngAfterViewInit(): void {
    const snapshot = this.route.snapshot;

    this.roomID =
      snapshot.paramMap.get('roomID') || 'room_' + this.generateRandomID();
    this.userID =
      snapshot.queryParamMap.get('userID') || this.generateRandomID();
    this.userName =
      snapshot.queryParamMap.get('userName') || 'User_' + this.userID;

    if (!this.isJoined && this.root?.nativeElement) {
      this.isJoined = true;
      this.startCall();
    }
  }

  async startCall() {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    } catch (error) {
      alert('من فضلك اسمح للكاميرا والميكروفون علشان تدخل المكالمة');
      this.isLoading = false;
      return;
    }

    const token = ZegoUIKitPrebuilt.generateKitTokenForTest(
      1062422416,
      '61661a69c0798a1f4372b88f9c483cd7',
      this.roomID,
      this.userID,
      this.userName
    );

    const zp = ZegoUIKitPrebuilt.create(token);
    this.zpInstance = zp;

    zp.joinRoom({
      container: this.root.nativeElement,
      sharedLinks: [
        {
          name: 'انضم للمكالمة',
          url:
            window.location.origin +
            window.location.pathname +
            '?userID=' +
            this.userID +
            '&userName=' +
            encodeURIComponent(this.userName),
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
    });

    // ✅ نخفي اللودينج بعد ثانيتين
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  returnToChat() {
    this.router.navigate([
      '/consultations_messages',
      this.roomID.replace('room_', ''),
    ]);
  }

  ngOnDestroy(): void {
    try {
      this.zpInstance?.destroy();
    } catch (err) {
      console.warn('Error on destroy:', err);
    }
  }

  private generateRandomID(length: number = 6): string {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
