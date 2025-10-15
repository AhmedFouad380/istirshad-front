# Global Error Handling Implementation Guide

## Overview

This project now implements a **global HTTP interceptor** that automatically handles all API errors across the entire application. This means you no longer need to write error handling code in every service or component.

## What's Been Implemented

### 1. Error Interceptor (`src/app/interceptors/error.interceptor.ts`)

A global interceptor that catches all HTTP errors and handles them automatically:

- **Network Errors (0)**: Connection failures, CORS issues
- **Bad Request (400)**: Invalid request format
- **Unauthorized (401)**: Session expired - auto redirects to login
- **Forbidden (403)**: Insufficient permissions
- **Not Found (404)**: Resource doesn't exist
- **Validation Errors (422)**: Form validation failures with detailed messages
- **Too Many Requests (429)**: Rate limiting exceeded
- **Server Errors (500-504)**: Various server-side issues

### 2. Automatic Features

✅ **Auto Toast Notifications**: All errors automatically show Arabic error messages
✅ **Auto Login Redirect**: 401 errors automatically redirect to login page
✅ **User Type Detection**: Redirects to correct login page (Individual/Expert)
✅ **Redirect URL Saving**: Saves current page to redirect back after login
✅ **Token Cleanup**: Automatically clears invalid tokens
✅ **Validation Error Display**: Shows all validation errors from backend

## How to Use in Your Components

### Before (❌ Old Way - Manual Error Handling):

```typescript
this.consultationsService.storeConsultation(formData).subscribe({
  next: (response) => {
    this.toaster.success('Success message');
  },
  error: (err) => {
    // Manual error handling
    if (err.status === 401) {
      localStorage.setItem('redirectUrl', this.router.url);
      this.router.navigate(['/Auth/Individual_login']);
    } else if (err.status === 404) {
      this.toaster.error('Not found');
    } else if (err.status === 500) {
      this.toaster.error('Server error');
    }
    // ... more manual error handling
  },
  complete: () => {
    this.isSubmitting = false;
  },
});
```

### After (✅ New Way - Automatic Error Handling):

```typescript
this.consultationsService.storeConsultation(formData).subscribe({
  next: (response) => {
    this.toaster.success('تم إرسال الاستشارة بنجاح');
    // Handle success
  },
  error: (err) => {
    // Error is already handled by interceptor!
    // Only add component-specific logic if needed
    console.error('Error:', err);
  },
  complete: () => {
    this.isSubmitting = false;
  },
});
```

### Even Simpler (✅ Best Practice):

```typescript
this.consultationsService.storeConsultation(formData).subscribe({
  next: (response) => {
    this.toaster.success('تم إرسال الاستشارة بنجاح');
    this.closeModal();
    this.resetForm();
  },
  error: () => {
    // Interceptor handles everything!
    // No need to write any code here unless you have specific component logic
  },
  complete: () => {
    this.isSubmitting = false;
  },
});
```

## How to Use in Your Services

### Before (❌ Old Way):

```typescript
import { catchError, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

export class MyService {
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  getData(): Observable<any> {
    return this.http
      .get('api/data')
      .pipe(catchError(this.handleError.bind(this)));
  }

  private handleError(error: HttpErrorResponse) {
    // 50+ lines of error handling code...
    return throwError(() => error);
  }
}
```

### After (✅ New Way):

```typescript
export class MyService {
  constructor(private http: HttpClient) {}

  getData(): Observable<any> {
    return this.http.get('api/data');
    // That's it! No error handling needed
  }

  postData(data: any): Observable<any> {
    return this.http.post('api/data', data);
    // Interceptor handles all errors automatically
  }
}
```

## Services to Update

The following services should be simplified by removing manual error handling:

1. ✅ `consultations.service.ts` - Already updated
2. ⏳ `auth.service.ts`
3. ⏳ `consultant.service.ts`
4. ⏳ `categories.service.ts`
5. ⏳ `chat.service.ts`
6. ⏳ `contact.service.ts`
7. ⏳ `ExpertConsultations.service.ts`
8. ⏳ `home.service.ts`
9. ⏳ `about.service.ts`
10. ⏳ `faq.service.ts`
11. ⏳ `settings.service.ts`

## Error Object Structure

If you need to access error details in your component, the interceptor returns:

```typescript
{
  status: number,          // HTTP status code
  message: string,         // Localized error message
  originalError: any,      // Original HTTP error
  errors: object | null    // Validation errors (422 only)
}
```

## Custom Error Handling (When Needed)

Sometimes you need component-specific error handling:

```typescript
this.myService.getData().subscribe({
  next: (response) => {
    // Handle success
  },
  error: (err) => {
    // Interceptor already showed toast and handled auth
    
    // Add component-specific logic only if needed:
    if (err.status === 404) {
      this.showEmptyState = true;
    }
    
    // Access validation errors:
    if (err.status === 422 && err.errors) {
      this.formErrors = err.errors;
    }
  },
});
```

## Disabling Toast for Specific Calls

If you want to handle an error silently (no toast):

```typescript
// This feature can be added to the interceptor if needed
// For now, the interceptor always shows toasts
```

## Testing

### Test 401 (Unauthorized):
- Make API call with invalid/expired token
- Should see: "انتهت صلاحية تسجيل الدخول" toast
- Should redirect to login page
- Should save current URL for redirect after login

### Test 404 (Not Found):
- Request non-existent resource
- Should see: "البيانات المطلوبة غير موجودة" toast

### Test 422 (Validation):
- Submit form with invalid data
- Should see: Validation errors in toast

### Test 500 (Server Error):
- Trigger server error
- Should see: "خطأ في الخادم الداخلي" toast

### Test Network Error:
- Disconnect internet
- Should see: "فشل الاتصال بالخادم" toast

## Benefits

✅ **DRY Principle**: Write error handling code once, use everywhere
✅ **Consistency**: All errors handled the same way
✅ **Maintainability**: Update error handling in one place
✅ **Less Code**: Remove 50+ lines from each service
✅ **Better UX**: Consistent error messages and behavior
✅ **Auto Auth**: Automatic login redirect and token cleanup
✅ **Localized**: All error messages in Arabic

## Migration Checklist

For each service:
1. ⬜ Remove `ToastrService` from imports
2. ⬜ Remove `Router` from imports (unless needed for other reasons)
3. ⬜ Remove `catchError`, `throwError` from rxjs imports
4. ⬜ Remove `ToastrService`, `Router` from constructor
5. ⬜ Remove `.pipe(catchError(this.handleError.bind(this)))` from all methods
6. ⬜ Delete `handleError()` method
7. ⬜ Test all API calls

For each component:
1. ⬜ Simplify error handling in subscribe blocks
2. ⬜ Remove manual 401 checks and redirects
3. ⬜ Remove manual toast notifications for errors
4. ⬜ Keep only component-specific error logic
5. ⬜ Test all API calls

## Notes

- The interceptor handles ALL HTTP calls automatically
- No configuration needed in individual services
- Works with all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Automatically handles all status codes
- Maintains backward compatibility with existing code
