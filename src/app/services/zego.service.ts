import { Injectable } from '@angular/core';

declare var ZegoUIKitPrebuilt: any;

@Injectable({
  providedIn: 'root',
})
export class ZegoService {
  appID = 353793651; // حطيتلك الـ appID اللي معاك
  serverSecret = 'dc4a537ed6eb48c90e6d95354514da52'; // الـ appSign الخاص بيك

  generateToken(roomID: string): string {
    const userID = Date.now().toString(); // أو ID من الـ Auth system لو عندك
    const userName = 'User_' + userID;

    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      this.appID,
      this.serverSecret,
      roomID,
      userID,
      userName
    );

    return kitToken;
  }
}
