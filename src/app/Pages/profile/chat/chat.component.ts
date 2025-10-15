import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ChatService } from '../../../services/chat.service';
import { ReportService } from '../../../services/report.service';
import { ToastrService } from 'ngx-toastr';
import { PusherService } from '../../../services/pusher.service';
import { ZegoService } from '../../../services/zego.service';

interface Message {
  id?: number; // Server ID
  tempId?: string; // Temporary ID for optimistic updates
  content: string;
  audioSrc?: string | null;
  file?: string;
  isImage?: boolean;
  isDocument?: boolean;
  isRead?: boolean;
  time: string;
  alignment: string;
  style: string;
  status?: 'sending' | 'success' | 'error';
  originalFile?: File; // Store original file for retry
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
    private reportService: ReportService,
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
  showMobileMenu = false;
  
  // ✅ Pagination
  currentPage = 1;
  lastPage = 1;
  isLoadingMore = false;
  allMessages: Message[] = [];

  startCall() {
    const roomID = 'room_' + this.consultid;
    const userID = this.userdata?.id.toString();
    console.log();
    
    const userName = this.userdata?.name || 'User_' + userID;
this.chatService.startCall(this.consultid, this.userdata.type).subscribe({
  next: (res) => {
    console.log('Call started', res);
    this.toastr.success('تم بدء المكالمة بنجاح');
  },
  error: (err) => {
    // Error handled by interceptor
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
      // Only reload if message is not from current user (avoid duplicates)
      const newMessageId = data.message?.id;
      const exists = this.allMessages.find(m => m.id === newMessageId);
      
      if (!exists) {
        this.loadChats(this.consultid, this.userdata?.type, 1);
      }
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

  // ✅ Load messages with pagination support (WhatsApp style: newest at bottom)
  loadChats(id: any, type: string, page: number = 1): void {
    this.chatService.chatmessage(id, type, page).subscribe({
      next: (data) => {
        this.experts = data;
        
        // Get pagination info
        this.currentPage = data.data.message.meta.current_page;
        this.lastPage = data.data.message.meta.last_page;

        const rawMessages = data.data.message.data ?? [];

        // Process messages
        const processedMessages = rawMessages.map((msg: any) => {
          const isCurrentUser = msg.sender_type === this.userdata?.type;
          const voiceUrl = msg.type === 'voice' && msg.voice ? msg.voice : null;
          const fileUrl = msg.file || voiceUrl || null;
          const extension = fileUrl?.split('.').pop()?.toLowerCase() || '';

          return {
            id: msg.id,
            content: msg.message,
            audioSrc: voiceUrl,
            file: fileUrl,
            isImage: ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension),
            isDocument: ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension),
            isRead: msg.is_read === 1 || msg.is_read === '1',
            time: this.formatTime(msg.date),
            alignment: isCurrentUser ? 'items-start' : 'items-end',
            style: isCurrentUser
              ? 'bg-[#6E5EA9] text-white'
              : 'bg-[#F4F4F4] text-black',
            status: 'success' as const,
          };
        });

        // ✅ Sort oldest to newest (WhatsApp style)
        processedMessages.sort((a: any, b: any) => {
          if (!a.id || !b.id) return 0;
          return a.id - b.id; // Older messages first, newer at bottom
        });

        if (page === 1) {
          // First load - replace all messages
          this.allMessages = processedMessages;
          // Update display
          this.experts.data.message.data = this.allMessages;
          // Scroll to bottom after render
          setTimeout(() => {
            this.scrollToBottomNow();
          }, 200);
          this.setupPusher();
        } else {
          // Load more - prepend older messages at the TOP
          this.allMessages = [...processedMessages, ...this.allMessages];
          // Update display
          this.experts.data.message.data = this.allMessages;
        }
        
        this.isLoadingMore = false;
      },
      error: (err) => {
        console.error('Failed to load messages:', err);
        this.isLoadingMore = false;
      },
    });
  }

  // ✅ Load more messages on scroll UP (WhatsApp style)
  onScroll(event: any): void {
    const element = event.target;
    
    // Debug scroll position
    // console.log('Scroll:', element.scrollTop, '/', element.scrollHeight);
    
    // Check if scrolled to TOP (load older messages)
    if (element.scrollTop < 100 && !this.isLoadingMore && this.currentPage < this.lastPage) {
      this.isLoadingMore = true;
      const scrollHeight = element.scrollHeight;
      const scrollTop = element.scrollTop;
      
      this.loadChats(this.consultid, this.userdata?.type, this.currentPage + 1);
      
      // ✅ Maintain scroll position after loading older messages
      setTimeout(() => {
        const newScrollHeight = element.scrollHeight;
        element.scrollTop = scrollTop + (newScrollHeight - scrollHeight);
      }, 150);
    }
  }

  // ✅ Public method to scroll to bottom (can be called from HTML)
  scrollToBottomManual(): void {
    this.scrollToBottomNow();
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
 
  // ✅ Modern send with optimistic UI (add at bottom like WhatsApp)
  sendMessage() {
    const chatId = this.experts?.data?.chat?.id;
    if (!chatId || isNaN(chatId)) {
      console.error('chat_id غير صالح:', chatId);
      return;
    }

    const currentMessage = this.newMessage.trim();
    const formData = new FormData();
    formData.append('chat_id', String(chatId));

    // Text message
    if (currentMessage) {
      const tempId = 'temp-' + Date.now();
      const tempMessage: Message = {
        tempId,
        content: currentMessage,
        time: this.formatTime(new Date().toString()),
        alignment: 'items-start',
        style: 'bg-[#6E5EA9] text-white',
        status: 'sending',
      };

      // ✅ Add at BOTTOM (newest messages at bottom)
      this.allMessages.push(tempMessage);
      this.experts.data.message.data = this.allMessages;
      this.newMessage = '';
      setTimeout(() => this.scrollToBottom(), 50);

      // Send to server
      this.chatService
        .sendMessageToChat(
          { type: 'text', chat_id: chatId, message: currentMessage },
          this.userdata?.type
        )
        .subscribe({
          next: (response) => {
            // Update with server ID
            const msgIndex = this.allMessages.findIndex(m => m.tempId === tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex] = {
                ...this.allMessages[msgIndex],
                id: response.data?.id,
                status: 'success',
              };
              this.experts.data.message.data = this.allMessages;
            }
          },
          error: () => {
            // Mark as error
            const msgIndex = this.allMessages.findIndex(m => m.tempId === tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex].status = 'error';
              this.experts.data.message.data = this.allMessages;
            }
          },
        });
      return;
    }
    // Image message
    if (this.selectedImage) {
      const tempId = 'temp-' + Date.now();
      const tempImageMsg: Message = {
        tempId,
        content: '',
        file: this.imagePreview!,
        isImage: true,
        time: this.formatTime(new Date().toString()),
        alignment: 'items-start',
        style: 'bg-[#6E5EA9] text-white',
        status: 'sending',
        originalFile: this.selectedImage,
      };

      // ✅ Add at BOTTOM
      this.allMessages.push(tempImageMsg);
      this.experts.data.message.data = this.allMessages;
      
      const imageFile = this.selectedImage;
      this.selectedImage = null;
      this.imagePreview = null;
      setTimeout(() => this.scrollToBottom(), 50);

      formData.append('images[]', imageFile);
      formData.append('type', 'image');

      this.chatService
        .sendMessageToChat(formData, this.userdata?.type)
        .subscribe({
          next: (response) => {
            const msgIndex = this.allMessages.findIndex(m => m.tempId === tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex] = {
                ...this.allMessages[msgIndex],
                id: response.data?.id,
                file: response.data?.file || this.allMessages[msgIndex].file,
                status: 'success',
              };
              this.experts.data.message.data = this.allMessages;
            }
          },
          error: () => {
            const msgIndex = this.allMessages.findIndex(m => m.tempId === tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex].status = 'error';
              this.experts.data.message.data = this.allMessages;
            }
          },
        });
      return;
    }

    // File message
    if (this.selectedFile) {
      const tempId = 'temp-' + Date.now();
      const tempFileMsg: Message = {
        tempId,
        content: this.selectedFile.name,
        isDocument: true,
        time: this.formatTime(new Date().toString()),
        alignment: 'items-start',
        style: 'bg-[#6E5EA9] text-white',
        status: 'sending',
        originalFile: this.selectedFile,
      };

      // ✅ Add at BOTTOM
      this.allMessages.push(tempFileMsg);
      this.experts.data.message.data = this.allMessages;
      
      const fileToSend = this.selectedFile;
      this.selectedFile = null;
      setTimeout(() => this.scrollToBottom(), 50);

      formData.append('file', fileToSend);
      formData.append('type', 'file');

      this.chatService
        .sendMessageToChat(formData, this.userdata?.type)
        .subscribe({
          next: (response) => {
            const msgIndex = this.allMessages.findIndex(m => m.tempId === tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex] = {
                ...this.allMessages[msgIndex],
                id: response.data?.id,
                file: response.data?.file,
                status: 'success',
              };
              this.experts.data.message.data = this.allMessages;
            }
          },
          error: () => {
            const msgIndex = this.allMessages.findIndex(m => m.tempId === tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex].status = 'error';
              this.experts.data.message.data = this.allMessages;
            }
          },
        });
      return;
    }

    // Voice message
    if (this.audioBlob) {
      const tempId = 'temp-' + Date.now();
      const audioURL = URL.createObjectURL(this.audioBlob);
      
      const tempAudioMsg: Message = {
        tempId,
        content: '',
        audioSrc: audioURL,
        file: audioURL,
        time: this.formatTime(new Date().toString()),
        alignment: 'items-start',
        style: 'bg-[#6E5EA9] text-white',
        status: 'sending',
      };

      // ✅ Add at BOTTOM
      this.allMessages.push(tempAudioMsg);
      this.experts.data.message.data = this.allMessages;
      
      const audioToSend = this.audioBlob;
      this.audioBlob = null;
      setTimeout(() => this.scrollToBottom(), 50);

      formData.append('voice', audioToSend, 'recording.m4a');
      formData.append('type', 'voice');

      this.chatService
        .sendMessageToChat(formData, this.userdata?.type)
        .subscribe({
          next: (response) => {
            const msgIndex = this.allMessages.findIndex(m => m.tempId === tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex] = {
                ...this.allMessages[msgIndex],
                id: response.data?.id,
                audioSrc: response.data?.voice || this.allMessages[msgIndex].audioSrc,
                file: response.data?.voice || this.allMessages[msgIndex].file,
                status: 'success',
              };
              this.experts.data.message.data = this.allMessages;
            }
          },
          error: () => {
            const msgIndex = this.allMessages.findIndex(m => m.tempId === tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex].status = 'error';
              this.experts.data.message.data = this.allMessages;
            }
          },
        });
      return;
    }
  }
  // ✅ Retry failed message
  resendMessage(message: Message) {
    message.status = 'sending';
    this.experts.data.message.data = this.allMessages;

    const chatId = this.experts?.data?.chat?.id;
    const formData = new FormData();
    formData.append('chat_id', String(chatId));

    if (message.audioSrc) {
      // Retry voice
      fetch(message.audioSrc)
        .then((res) => res.blob())
        .then((blob) => {
          formData.append('voice', blob, 'recording.m4a');
          formData.append('type', 'voice');
          this.retryMessageRequest(message, formData);
        });
    } else if (message.isImage && message.originalFile) {
      // Retry image
      formData.append('images[]', message.originalFile);
      formData.append('type', 'image');
      this.retryMessageRequest(message, formData);
    } else if (message.isDocument && message.originalFile) {
      // Retry file
      formData.append('file', message.originalFile);
      formData.append('type', 'file');
      this.retryMessageRequest(message, formData);
    } else {
      // Retry text
      this.chatService
        .sendMessageToChat(
          { type: 'text', chat_id: chatId, message: message.content },
          this.userdata?.type
        )
        .subscribe({
          next: (response) => {
            const msgIndex = this.allMessages.findIndex(m => m.tempId === message.tempId);
            if (msgIndex !== -1) {
              this.allMessages[msgIndex] = {
                ...this.allMessages[msgIndex],
                id: response.data?.id,
                status: 'success',
              };
              this.experts.data.message.data = this.allMessages;
            }
          },
          error: () => {
            message.status = 'error';
            this.experts.data.message.data = this.allMessages;
          },
        });
    }
  }

  private retryMessageRequest(message: Message, formData: FormData) {
    this.chatService
      .sendMessageToChat(formData, this.userdata?.type)
      .subscribe({
        next: (response) => {
          const msgIndex = this.allMessages.findIndex(m => m.tempId === message.tempId);
          if (msgIndex !== -1) {
            this.allMessages[msgIndex] = {
              ...this.allMessages[msgIndex],
              id: response.data?.id,
              status: 'success',
            };
            this.experts.data.message.data = this.allMessages;
          }
        },
        error: () => {
          message.status = 'error';
          this.experts.data.message.data = this.allMessages;
        },
      });
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
      next: () => {
        this.toastr.success('تم حفظ التقييم بنجاح');
        this.showConfirmModal = false;
        this.showRateModal = false;

        if (this.experts?.data?.consultation?.type !== 'completed') {
          this.completeConsultation();
        }
      },
      error: () => {
        // Error handled by interceptor
        console.error('فشل حفظ التقييم');
        if (this.experts?.data?.consultation?.type !== 'completed') {
          this.completeConsultation();
        }
      },
    });
  }
  showComplaintModal = false;
  isSubmittingComplaint = false;
  selectedComplaintFile: File | null = null;

  selectedReason = 'أسباب أخرى';

  complaintText = '';

  complaintReasons = [
    'أسباب أخرى',
    'مشكلة في التعامل',
    'سوء استخدام',
    'مخالفة الشروط',
    'محتوى غير لائق',
  ];

  onComplaintFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedComplaintFile = file;
    }
  }

  submitComplaint() {
    // Validation
    if (!this.complaintText.trim()) {
      this.toastr.warning('الرجاء كتابة نص الشكوى', 'تنبيه');
      return;
    }

    if (!this.consultid) {
      this.toastr.error('معرف الاستشارة غير متوفر', 'خطأ');
      return;
    }

    this.isSubmittingComplaint = true;

    // Prepare FormData
    const formData = new FormData();
    formData.append('consultation_id', String(this.consultid));
    formData.append('title', this.selectedReason);
    formData.append('description', this.complaintText);
    
    if (this.selectedComplaintFile) {
      formData.append('file', this.selectedComplaintFile);
    }

    // Send to API
    this.reportService.storeReport(formData).subscribe({
      next: (res: any) => {
        this.toastr.success('تم إرسال الشكوى بنجاح', 'نجاح');
        this.showComplaintModal = false;
        this.resetComplaintForm();
        this.isSubmittingComplaint = false;
      },
      error: (err) => {
        console.error('فشل في إرسال الشكوى', err);
        this.isSubmittingComplaint = false;
      }
    });
  }

  resetComplaintForm() {
    this.selectedReason = 'أسباب أخرى';
    this.complaintText = '';
    this.selectedComplaintFile = null;
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
        next: () => {
          this.showConfirmModal = false;
          this.showRateModal = false;
          this.toastr.success('تم إنهاء الاستشارة بنجاح');
          this.router.navigate(['/profile/personal']);
        },
        error: () => {
          // Error handled by interceptor
          console.error('فشل إنهاء الاستشارة');
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
  mediaStream: MediaStream | null = null;

  startRecording() {
    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.recordingDuration = '00:00';

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        this.mediaStream = stream;
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          // Stop all media tracks
          this.stopMediaStream();
          
          if (this.audioChunks.length > 0) {
            const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.sendAudioMessage(audioBlob);
          }
          
          this.isRecording = false;
          clearInterval(this.recordingInterval);
          this.recordingDuration = '00:00';
          this.audioChunks = [];
        };

        this.mediaRecorder.start();

        // Update timer every 100ms for smoother display
        this.recordingInterval = setInterval(() => {
          const elapsed = Date.now() - this.recordingStartTime;
          const minutes = Math.floor(elapsed / 60000)
            .toString()
            .padStart(2, '0');
          const seconds = Math.floor((elapsed % 60000) / 1000)
            .toString()
            .padStart(2, '0');
          this.recordingDuration = `${minutes}:${seconds}`;
          
          // Auto-stop after 5 minutes
          if (elapsed >= 300000) {
            this.stopRecording();
            this.toastr.info('تم إيقاف التسجيل تلقائياً بعد 5 دقائق');
          }
        }, 100);
      })
      .catch((error) => {
        console.error('خطأ في الوصول للمايك:', error);
        this.isRecording = false;
        
        if (error.name === 'NotAllowedError') {
          this.toastr.error('يرجى السماح بالوصول للمايكروفون');
        } else if (error.name === 'NotFoundError') {
          this.toastr.error('لم يتم العثور على مايكروفون');
        } else {
          this.toastr.error('فشل تسجيل الصوت');
        }
      });
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  cancelRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    this.stopMediaStream();
    this.isRecording = false;
    this.audioChunks = [];
    clearInterval(this.recordingInterval);
    this.recordingDuration = '00:00';
    this.toastr.info('تم إلغاء التسجيل');
  }

  private stopMediaStream() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
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
  private shouldScrollToBottom = false;

  ngAfterViewChecked() {
    // Only scroll to bottom when explicitly requested
    if (this.shouldScrollToBottom) {
      this.scrollToBottomNow();
      this.shouldScrollToBottom = false;
    }
  }

  // Request scroll to bottom (will execute in next view check)
  private scrollToBottom(): void {
    this.shouldScrollToBottom = true;
  }

  // Immediate scroll to bottom
  private scrollToBottomNow(): void {
    try {
      if (this.scrollContainer) {
        const container = this.scrollContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
