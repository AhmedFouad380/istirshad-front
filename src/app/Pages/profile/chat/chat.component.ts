import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { ToastrService } from 'ngx-toastr';
import { PusherService } from '../../../services/pusher.service';
import { ZegoService } from '../../../services/zego.service';

interface Message {
  content: string;
  audioSrc?: string | null;
  file?: string;
  isImage?: boolean;
  isDocument?: boolean;
  isRead?: boolean;
  time: string;
  alignment: string;
  style: string;
  status?: 'sending' | 'success' | 'error'; // حالة الرسالة
  tempId?: string; // معرف مؤقت للرسائل الجديدة
}

interface Expert {
  id: number;
  name: string;
  image: string;
  online: boolean;
  date: string;
  messages: Message[];
}

@Component({
  selector: 'app-chat',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  constructor(
    private chatService: ChatService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private pusherService: PusherService,
    private zegoService: ZegoService
  ) {}
  @ViewChild('callContainer', { static: false }) callContainer!: ElementRef;
  showCall = false;

  experts: any;
  userdata: any;
  pendingMessages: Message[] = []; // رسائل في انتظار الإرسال
  showMobileMenu = false;

  startCall() {
    const roomID = 'room_' + this.consultid;
    const userID = this.userdata?.id.toString();
    console.log();
    
    const userName = this.userdata?.name || 'User_' + userID;
this.chatService.startCall(this.consultid, this.userdata.type).subscribe({
  next: (res) => {
    console.log('Call started', res);
    // ممكن هنا تروح على صفحة المكالمة
  },
  error: (err) => {
    console.error('Error starting call', err);
  },
});
    this.router.navigate(['/call', roomID], {
      queryParams: {
        userID: userID,
        userName: userName,
      },
    });
  }

  private setupPusher() {
    if (!this.consultid) return;

    const channelName = `MessageSent-channel-${this.experts?.data?.chat?.id}`;
    const channel = this.pusherService.subscribe(channelName);

    channel.bind('App\\Events\\chatEvent', (data: any) => {
      this.loadChats(this.consultid, this.userdata?.type);
    });
    channel.bind('App\\Events\\chatEvent', (data: any) => {
      this.loadChats(this.consultid, this.userdata?.type);
    });

    channel.bind('message-read', (data: any) => {
      if (data.chat_id === this.experts?.data?.chat?.id) {
        this.updateReadStatus(data.message_id);
      }
    });
  }

  // تحديث حالة القراءة للرسائل
  private updateReadStatus(messageId: number) {
    if (this.experts?.data?.message?.data) {
      this.experts.data.message.data = this.experts.data.message.data.map(
        (msg: any) => {
          if (msg.id === messageId) {
            return { ...msg, isRead: true };
          }
          return msg;
        }
      );
    }
  }

  ngOnDestroy() {
    if (this.consultid) {
      this.pusherService.unsubscribe(`chat.${this.consultid}`);
    }
    this.pusherService.disconnect();
  }
  consultid: number | null = null;

  ngOnInit(): void {
    const storedData = localStorage.getItem('user');
    this.route.queryParamMap.subscribe((queryParams) => {
      const fromNotification = queryParams.get('from_notification');
      if (fromNotification === 'end-consultation') {
        this.showRateModal = true;
      }
    });
    if (storedData) {
      this.userdata = JSON.parse(storedData);
    }

    this.route.paramMap.subscribe((params) => {
      this.consultid = Number(params.get('id'));
      if (this.consultid) {
        this.loadChatsAndSetupPusher(); // استدعاء الدالة الجديدة
      }
    });
  }

  // دالة جديدة تجمع بين تحميل الدردشة وإعداد Pusher
  loadChatsAndSetupPusher(): void {
    this.loadChats(this.consultid, this.userdata?.type);
  }

  // تعديل دالة loadChats الحالية
  loadChats(id: any, type: string): void {
    setTimeout(() => this.scrollToBottom(), 100);

    this.chatService.chatmessage(id, type).subscribe({
      next: (data) => {
        this.experts = data;

        const rawMessages = this.experts?.data?.message?.data ?? [];

        // ترتيب حسب الوقت
        rawMessages.sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // معالجة الرسائل
        this.experts.data.message.data = rawMessages.map((msg: any) => {
          const isCurrentUser = msg.sender_type === this.userdata?.type;

          const voiceUrl = msg.type === 'voice' && msg.voice ? msg.voice : null;
          const fileUrl = msg.file || voiceUrl || null;
          const extension = fileUrl?.split('.').pop()?.toLowerCase() || '';

          return {
            content: msg.message,
            audioSrc: voiceUrl,
            file: fileUrl,
            isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension),
            isDocument: ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(
              extension
            ),
            isRead: msg.is_read === '1',
            time: this.formatTime(msg.date),
            alignment: isCurrentUser ? 'items-start' : 'items-end',
            style: isCurrentUser
              ? 'bg-[#6E5EA9] text-white'
              : 'bg-[#F4F4F4] text-black',
            status: 'success',
          };
        });

        this.mergePendingMessages();
        this.setupPusher(); // تفعيل الربط مع Pusher بعد التحميل
      },

      error: (err) => {
        console.error('Failed to load messages:', err);
        this.experts = [];
      },
    });
  }

  getAudioMimeType(src: string): string {
    const ext = src?.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'mp3':
        return 'audio/mpeg';
      case 'ogg':
        return 'audio/ogg';
      case 'webm':
        return 'audio/webm';
      case 'm4a':
        return 'audio/mp4'; // ✅ ده النوع المعتمد لـ m4a
      default:
        return 'audio/mp4'; // ✅ نخليها mp4 كديفولت لدعم m4a
    }
  }

  formatTime(dateTime: string): string {
    const date = new Date(dateTime);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  newMessage: string = '';
  selectedFile: File | null = null;
  selectedImage: File | null = null;
  audioBlob: Blob | null = null;
 
  sendMessage() {
    const chatId = this.experts?.data?.chat?.id;
    if (!chatId || isNaN(chatId)) {
      console.error('chat_id غير صالح:', chatId);
      return;
    }

    // حفظ الرسالة الحالية في متغير مؤقت
    const currentMessage = this.newMessage.trim();

    // مسح حقل الإدخال فورًا
    this.newMessage = '';

    const formData = new FormData();
    formData.append('chat_id', String(chatId));

    const tempMessage: Message = {
      content: currentMessage,
      time: this.formatTime(new Date().toString()),
      alignment: 'items-start',
      style: 'bg-[#6E5EA9] text-white',
      status: 'sending',
      tempId: 'temp-' + Date.now(),
    };

    if (currentMessage) {
      this.pendingMessages.push(tempMessage);
      this.mergePendingMessages();

      this.chatService
        .sendMessageToChat(
          { type: 'text', chat_id: chatId, message: currentMessage },
          this.userdata?.type
        )
        .subscribe({
          next: () => {
            tempMessage.status = 'success';
            this.selectedImage = null;
            this.imagePreview = null;
            this.selectedFile = null;
            this.audioBlob = null;
            this.mergePendingMessages();
          },
          error: () => {
            tempMessage.status = 'error';
            // إعادة تعيين الرسالة في حالة الفشل إذا كانت نصية
            if (
              !tempMessage.isImage &&
              !tempMessage.isDocument &&
              !tempMessage.audioSrc
            ) {
              this.newMessage = currentMessage;
            }
          },
        });
      return;
    }
    // لو صورة
    if (this.selectedImage) {
      formData.append('images[]', this.selectedImage);
      formData.append('type', 'image');

      const tempImageMsg: Message = {
        content: '',
        file: this.imagePreview!,
        isImage: true,
        isDocument: false,
        time: this.formatTime(new Date().toString()),
        alignment: 'items-start',
        style: 'bg-[#6E5EA9] text-white',
        status: 'sending',
        tempId: 'temp-' + Date.now(),
      };

      this.pendingMessages.push(tempImageMsg);
      this.mergePendingMessages();
      this.selectedImage = null;
      this.imagePreview = null;
      this.storedOriginalImage = this.selectedImage; // لو محتاج تعيد إرسالها بعدين

      this.chatService
        .sendMessageToChat(formData, this.userdata?.type)
        .subscribe({
          next: () => {
            tempImageMsg.status = 'success';
            this.selectedImage = null;
            this.imagePreview = null;
            this.mergePendingMessages();
          },
          error: () => {
            tempImageMsg.status = 'error';
          },
        });

      return;
    }

    // لو فايل
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
      formData.append('type', 'file');

      const tempFileMsg: Message = {
        content: '',
        file: '',
        isImage: false,
        isDocument: true,
        time: this.formatTime(new Date().toString()),
        alignment: 'items-start',
        style: 'bg-[#6E5EA9] text-white',
        status: 'sending',
        tempId: 'temp-' + Date.now(),
      };

      this.pendingMessages.push(tempFileMsg);
      this.mergePendingMessages();

      this.chatService
        .sendMessageToChat(formData, this.userdata?.type)
        .subscribe({
          next: (res) => {
            tempFileMsg.status = 'success';
            this.selectedFile = null;
            this.mergePendingMessages();
          },
          error: () => {
            tempFileMsg.status = 'error';
          },
        });

      return;
    }

    // لو صوت
    if (this.audioBlob) {
      const audioURL = URL.createObjectURL(this.audioBlob);

      formData.append('voice', this.audioBlob, 'recording.m4a');
      formData.append('type', 'voice');

      const tempAudioMsg: Message = {
        content: '',
        audioSrc: audioURL,
        file: audioURL, // 👈 أضف دي علشان الـ isDocument/isImage ما يتلخبطوش
        isImage: false,
        isDocument: false,
        time: this.formatTime(new Date().toString()),
        alignment: 'items-start',
        style: 'bg-[#6E5EA9] text-white',
        status: 'sending',
        tempId: 'temp-' + Date.now(),
      };

      this.pendingMessages.push(tempAudioMsg);
      this.mergePendingMessages();

      this.chatService
        .sendMessageToChat(formData, this.userdata?.type)
        .subscribe({
          next: () => {
            tempAudioMsg.status = 'success';
            this.audioBlob = null;
            this.mergePendingMessages();
          },
          error: () => {
            tempAudioMsg.status = 'error';
          },
        });

      return;
    }

    // ... باقي الكود الخاص بالصور والملفات والصوت ...
  }
  // دمج الرسائل المؤقتة مع الرسائل المحملة
  mergePendingMessages() {
    if (!this.experts?.data?.message?.data) return;

    // إزالة الرسائل المؤقتة التي تم إرسالها بنجاح
    this.pendingMessages = this.pendingMessages.filter(
      (msg) => msg.status !== 'success'
    );

    // إضافة الرسائل المؤقتة التي لم يتم إرسالها بعد
    this.experts.data.message.data = [
      ...this.experts.data.message.data,
      ...this.pendingMessages,
    ];
  }
  storedOriginalImage: any = null;
  storedOriginalFile: any = null;
  // إعادة إرسال رسالة فاشلة
  // إعادة إرسال رسالة فاشلة
  resendMessage(message: Message) {
    // إزالة الرسالة من القائمة المؤقتة أولاً
    this.pendingMessages = this.pendingMessages.filter(
      (m) => m.tempId !== message.tempId
    );

    // تحديث حالة الرسالة
    message.status = 'sending';

    // إعادة إضافة الرسالة إلى القائمة المؤقتة
    this.pendingMessages.push(message);
    this.mergePendingMessages();

    if (message.audioSrc) {
      // إعادة إرسال رسالة صوتية
      fetch(message.audioSrc)
        .then((res) => res.blob())
        .then((blob) => {
          this.audioBlob = blob;
          this.sendMessage();
        });
    } else if (message.isImage) {
      // هنا يجب عليك تخزين الملف الأصلي في متغير عند الاختيار الأول
      if (this.storedOriginalImage) {
        this.selectedImage = this.storedOriginalImage;
        // this.imagePreview = message.file;
        this.sendMessage();
      }
    } else if (message.isDocument) {
      // هنا يجب تخزين الملف الأصلي في متغير عند الاختيار الأول
      if (this.storedOriginalFile) {
        this.selectedFile = this.storedOriginalFile;
        this.sendMessage();
      }
    } else {
      // إعادة إرسال رسالة نصية
      this.newMessage = message.content;
      this.sendMessage();
    }
  }
  // متغير للتحكم في عرض نافذة التأكيد
  showConfirmModal: boolean = false;
  showRateModal: boolean = false;
  rate: number = 0;
  description: string = '';
  // دالة عند النقر على زر إنهاء المحادثة
  endChat() {
    this.showConfirmModal = true; // عرض نافذة التأكيد
  }

  // دالة عند النقر على إلغاء في النافذة
  onCancel() {
    this.showConfirmModal = false; // إخفاء نافذة التأكيد
  }

  onConfirm() {
    this.showConfirmModal = false;
    this.showRateModal = true; // عرض نافذة التقييم بدلاً من إنهاء المحادثة مباشرة
  }
  // دالة عند النقر على تأكيد الإنهاء
  submitRate() {
    if (this.rate === 0) {
      this.toastr.error('الرجاء اختيار تقييم قبل الإرسال');
      return;
    }

    const rateData = {
      consultation_id: this.consultid,
      rate: this.rate,
      description: this.description,
    };

    this.chatService.storeRate(rateData, this.userdata.type).subscribe({
      next: (res) => {
        this.toastr.success('تم حفظ التقييم بنجاح');
        this.showConfirmModal = false;
        this.showRateModal = false; // عرض نافذة التقييم بدلاً من إنهاء المحادثة مباشرة

        if (this.experts?.data?.consultation?.type !== 'completed') {
          this.completeConsultation();
        }
      },
      error: (err) => {
        this.toastr.error('حدث خطأ أثناء حفظ التقييم');
        console.error('فشل حفظ التقييم:', err);
        if (this.experts?.data?.consultation?.type !== 'completed') {
          this.completeConsultation();
        }
      },
    });
  }
  showComplaintModal = false;

  selectedReason = 'أسباب أخرى';

  complaintText = '';

  complaintReasons = [
    'أسباب أخرى',
    'مشكلة في التعامل',
    'سوء استخدام',
    'مخالفة الشروط',
    'محتوى غير لائق',
  ];

  submitComplaint() {
    this.showComplaintModal = false;
  }

  ratingOptions = [
    { value: 1, label: 'غير مفيد' },
    { value: 2, label: 'مفيد بعض الشيء' },
    { value: 3, label: 'مفيد' },
    { value: 4, label: 'مفيد جدا' },
    { value: 5, label: 'أرشحه للاصدقاء' },
  ];

  completeConsultation() {
    const consultion_id = this.consultid;
    this.chatService
      .compeleteConsultation(consultion_id, this.userdata.type)
      .subscribe({
        next: (res) => {
          this.showConfirmModal = false;
          this.showRateModal = false; // عرض نافذة التقييم بدلاً من إنهاء المحادثة مباشرة
          this.router.navigate(['/profile/personal']);
        },
        error: (err) => {
          console.error('فشل إنهاء الاستشارة:', err);
        },
      });
  }

  mediaRecorder: MediaRecorder | null = null;
  audioChunks: Blob[] = [];
  audioUrl: string | null = null;
  isRecording: boolean = false;
  recordingStartTime: number = 0;
  recordingDuration: string = '00:00';
  recordingInterval: any = null;

  startRecording() {
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.recordingDuration = '00:00';

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
          this.audioUrl;
          this.sendAudioMessage(audioBlob);
          this.isRecording = false;
          clearInterval(this.recordingInterval);
          this.recordingDuration = '00:00';
        };

        this.mediaRecorder.start();

        this.recordingInterval = setInterval(() => {
          const elapsed = Date.now() - this.recordingStartTime;
          const minutes = Math.floor(elapsed / 60000)
            .toString()
            .padStart(2, '0');
          const seconds = Math.floor((elapsed % 60000) / 1000)
            .toString()
            .padStart(2, '0');
          this.recordingDuration = `${minutes}:${seconds}`;
        }, 500);
      })
      .catch((error) => {
        console.error('Mic error:', error);
        this.isRecording = false;
      });
  }

  stopRecording() {
    this.mediaRecorder?.stop();
  }

  toggleRecording() {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  sendAudioMessage(blob: Blob) {
    this.audioBlob = blob;
    this.sendMessage();
  }

  handleFileUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      this.selectedFile = target.files[0];
    }
  }
  imagePreview: string | null = null;

  handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      this.selectedImage = target.files[0];

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  removeSelectedImage() {
    this.selectedImage = null;
    this.imagePreview = null;
  }

  removeSelectedFile() {
    this.selectedFile = null;
  }

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      const container = this.scrollContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
