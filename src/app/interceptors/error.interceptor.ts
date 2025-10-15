import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'حدث خطأ غير متوقع';
      let shouldShowToast = true;

      // Client-side or network error
      if (error.error instanceof ErrorEvent) {
        errorMessage = 'خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت';
        console.error('Client-side error:', error.error.message);
      } else {
        // Server-side error
        console.error(
          `Backend returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`
        );

        switch (error.status) {
          case 0:
            // Network error or CORS issue
            errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت';
            break;

          case 400:
            errorMessage = error.error?.message || 'طلب غير صحيح';
            break;

          case 401:
            errorMessage = error.error?.message || 'انتهت صلاحية تسجيل الدخول، يرجى تسجيل الدخول مرة أخرى';
            // Clear local storage and redirect to login
            const userType = localStorage.getItem('userType');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            
            // Save the current URL to redirect back after login
            const currentUrl = router.url;
            if (!currentUrl.includes('Auth')) {
              localStorage.setItem('redirectUrl', currentUrl);
            }

            // Redirect based on user type
            if (userType === 'expert') {
              router.navigate(['/Auth/Expert_Login']);
            } else {
              router.navigate(['/Auth/Individual_login']);
            }
            break;

          case 403:
            errorMessage = error.error?.message || 'ليس لديك صلاحية للقيام بهذا الإجراء';
            break;

          case 404:
            errorMessage = error.error?.message || 'البيانات المطلوبة غير موجودة';
            break;

          case 422:
            // Validation errors
            errorMessage = 'بيانات غير صالحة، يرجى التحقق من المدخلات';
            
            if (error.error?.errors) {
              const validationErrors = error.error.errors;
              const errorMessages: string[] = [];
              
              Object.keys(validationErrors).forEach(key => {
                if (Array.isArray(validationErrors[key])) {
                  errorMessages.push(...validationErrors[key]);
                } else {
                  errorMessages.push(validationErrors[key]);
                }
              });
              
              if (errorMessages.length > 0) {
                errorMessage = errorMessages.join('<br>');
              }
            } else if (error.error?.message) {
              errorMessage = error.error.message;
            }
            break;

          case 429:
            errorMessage = 'تم تجاوز الحد الأقصى للطلبات. يرجى المحاولة مرة أخرى لاحقاً';
            break;

          case 500:
            errorMessage = error.error?.message || 'خطأ في الخادم الداخلي. يرجى المحاولة مرة أخرى لاحقاً';
            break;

          case 502:
            errorMessage = 'خطأ في البوابة. الخادم غير متاح حالياً';
            break;

          case 503:
            errorMessage = 'الخدمة غير متاحة حالياً. يرجى المحاولة مرة أخرى لاحقاً';
            break;

          case 504:
            errorMessage = 'انتهت مهلة الاتصال بالخادم';
            break;

          default:
            if (error.error?.message) {
              errorMessage = error.error.message;
            } else {
              errorMessage = `حدث خطأ غير متوقع (كود: ${error.status})`;
            }
            break;
        }
      }

      // Show toast notification
      if (shouldShowToast) {
        toastr.error(errorMessage, 'خطأ', {
          timeOut: 5000,
          positionClass: 'toast-top-center',
          enableHtml: true,
          closeButton: true,
          progressBar: true,
        });
      }

      // Return error object for component-level handling if needed
      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        originalError: error,
        errors: error.error?.errors || null,
      }));
    })
  );
};
