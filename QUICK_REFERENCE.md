# 🚀 Quick Reference Guide - Gadeer Project

## Global Error Handling

### ✅ What You DON'T Need Anymore:

```typescript
// ❌ DON'T DO THIS
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

export class MyService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,  // ❌ Not needed
    private router: Router          // ❌ Not needed
  ) {}

  getData(): Observable<any> {
    return this.http.get('api/data')
      .pipe(catchError(this.handleError.bind(this))); // ❌ Not needed
  }

  private handleError(error: HttpErrorResponse) { // ❌ Delete this
    // 50+ lines of error handling...
  }
}
```

### ✅ What You SHOULD Do Now:

```typescript
// ✅ DO THIS
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export class MyService {
  constructor(private http: HttpClient) {} // ✅ Only HttpClient

  getData(): Observable<any> {
    return this.http.get('api/data'); // ✅ That's it!
  }
}
```

## Component API Calls

### ✅ Old Way (Manual Error Handling):

```typescript
// ❌ DON'T DO THIS
this.myService.getData().subscribe({
  next: (response) => {
    // Handle success
  },
  error: (err) => {
    if (err.status === 401) {
      localStorage.removeItem('token');
      this.router.navigate(['/login']);
      this.toastr.error('Session expired');
    } else if (err.status === 404) {
      this.toastr.error('Not found');
    } else if (err.status === 500) {
      this.toastr.error('Server error');
    }
    // ... more manual handling
  }
});
```

### ✅ New Way (Automatic):

```typescript
// ✅ DO THIS
this.myService.getData().subscribe({
  next: (response) => {
    this.toastr.success('تم التحميل بنجاح');
    // Handle success
  },
  error: () => {
    // Error already handled by interceptor!
    // Only add component-specific logic if needed
  }
});
```

## Voice Recording

### ✅ Start Recording:

```typescript
startRecording() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then((stream) => {
      this.mediaStream = stream;
      this.mediaRecorder = new MediaRecorder(stream);
      this.mediaRecorder.start();
      
      // Update timer every 100ms
      this.recordingInterval = setInterval(() => {
        this.updateRecordingDuration();
      }, 100);
    })
    .catch((error) => {
      // Handle permission errors
      if (error.name === 'NotAllowedError') {
        this.toastr.error('يرجى السماح بالوصول للمايكروفون');
      }
    });
}
```

### ✅ Stop Recording:

```typescript
stopRecording() {
  if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
    this.mediaRecorder.stop();
  }
  this.stopMediaStream(); // Clean up
}
```

### ✅ Cancel Recording:

```typescript
cancelRecording() {
  this.mediaRecorder?.stop();
  this.stopMediaStream();
  this.audioChunks = [];
  clearInterval(this.recordingInterval);
  this.toastr.info('تم إلغاء التسجيل');
}
```

## Error Status Codes Reference

| Code | Meaning | Auto Action | Toast Message |
|------|---------|-------------|---------------|
| 0 | Network Error | Show toast | فشل الاتصال بالخادم |
| 401 | Unauthorized | **Redirect to login** | انتهت صلاحية تسجيل الدخول |
| 403 | Forbidden | Show toast | ليس لديك صلاحية |
| 404 | Not Found | Show toast | البيانات المطلوبة غير موجودة |
| 422 | Validation | Show errors | Shows field errors |
| 500 | Server Error | Show toast | خطأ في الخادم الداخلي |

## Common Tasks

### ✅ Create New Service:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MyNewService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get(`${this.apiUrl}endpoint`);
  }

  postData(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}endpoint`, data);
  }
}
```

### ✅ Use Service in Component:

```typescript
export class MyComponent {
  isLoading = false;

  constructor(
    private myService: MyNewService,
    private toastr: ToastrService
  ) {}

  loadData() {
    this.isLoading = true;
    
    this.myService.getData().subscribe({
      next: (response) => {
        this.data = response.data;
        this.toastr.success('تم التحميل بنجاح');
      },
      error: () => {
        // Interceptor handles toast + redirect
        console.error('Error loading data');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
```

### ✅ Send FormData (Files/Images):

```typescript
sendFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'image');

  this.myService.uploadFile(formData).subscribe({
    next: (response) => {
      this.toastr.success('تم رفع الملف بنجاح');
    },
    error: () => {
      // Error handled automatically
    }
  });
}
```

## HTML Templates

### ✅ Loading State:

```html
<div *ngIf="isLoading" class="flex justify-center items-center">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6E5EA9]"></div>
</div>

<div *ngIf="!isLoading">
  <!-- Your content -->
</div>
```

### ✅ Voice Recording Button:

```html
<button 
  (click)="toggleRecording()" 
  [ngClass]="{
    'bg-red-500 scale-110': isRecording,
    'bg-gray-200 hover:bg-gray-300': !isRecording
  }"
  class="w-10 h-10 rounded-full transition-all">
  
  <!-- Microphone icon when idle -->
  <svg *ngIf="!isRecording">...</svg>
  
  <!-- Stop icon when recording -->
  <svg *ngIf="isRecording">...</svg>
</button>
```

### ✅ Recording Display:

```html
<div *ngIf="isRecording" class="flex items-center gap-2">
  <div class="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
  <span class="text-red-600 font-semibold">جاري التسجيل</span>
  <span class="font-mono">{{ recordingDuration }}</span>
</div>
```

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Check for errors
ng build --configuration development

# Format code
npm run format  # if configured

# Test specific component
ng test --include='**/chat.component.spec.ts'
```

## File Structure

```
src/app/
├── interceptors/
│   └── error.interceptor.ts          # Global error handler
├── services/
│   ├── chat.service.ts               # Clean service
│   └── consultations.service.ts      # Clean service
├── Pages/
│   └── profile/
│       └── chat/
│           ├── chat.component.ts     # Modern voice recording
│           ├── chat.component.html   # Modern UI
│           └── chat.component.css    # Animations
└── app.config.ts                     # Interceptor registration
```

## Cheat Sheet

### Remove from services:
```typescript
❌ import { ToastrService } from 'ngx-toastr';
❌ import { Router } from '@angular/router';
❌ import { catchError, throwError } from 'rxjs';
❌ private toastr: ToastrService
❌ private router: Router
❌ .pipe(catchError(this.handleError))
❌ private handleError(error) { ... }
```

### Keep in services:
```typescript
✅ import { HttpClient } from '@angular/common/http';
✅ import { Observable } from 'rxjs';
✅ constructor(private http: HttpClient) {}
✅ return this.http.get(...);
```

### Component error handling:
```typescript
this.service.apiCall().subscribe({
  next: (data) => {
    ✅ this.toastr.success('Success message');
    ✅ // Handle data
  },
  error: () => {
    ❌ // Don't show error toast here
    ❌ // Don't redirect to login here
    ✅ // Only component-specific logic
  }
});
```

## Need Help?

📖 Read the guides:
- `ERROR_HANDLING_GUIDE.md` - Complete error handling guide
- `CHAT_MODERNIZATION_GUIDE.md` - Voice chat guide
- `DEPLOYMENT.md` - Deployment instructions
- `PROJECT_IMPROVEMENTS_SUMMARY.md` - Overview of changes

---

**Last Updated**: October 15, 2025
**Version**: 1.0
