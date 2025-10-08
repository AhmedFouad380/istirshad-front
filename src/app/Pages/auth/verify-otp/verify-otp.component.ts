import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { InputsComponent } from "../../../shared/inputs/inputs.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-VerifyOtp',
  standalone: true,
  imports: [CommonModule,  ReactiveFormsModule, InputsComponent],
  templateUrl: './VerifyOtp.component.html',
  styleUrls: ['./VerifyOtp.component.css'],
})
export class VerifyOtpComponent implements OnInit {
  type: string = 'individual';
  otpForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  phone: string = '';
  submitted: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.otpForm = this.fb.group({
      otp: [
        '',
        [Validators.required, Validators.minLength(4), Validators.maxLength(6)],
      ],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.type = params['type'] || 'individual';
      this.phone = params['phone'] || '';
    });
    const savedCode = localStorage.getItem('otp_code');
    if (savedCode) {
      this.otpForm.patchValue({ otp: savedCode });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const otp = this.otpForm.value.otp;

    this.authService.verifyOtpWithFcm(this.phone, otp, this.type).subscribe({
      next: (response) => {
        this.isLoading = false;

        const token = response?.data?.token;
        const user = response?.data?.user;
        if (token && user) {
          this.authService.storeToken(token, user); // ✅ تخزين وتحديث البيانات داخل AuthService
          this.authService.forceRefresh(); // ✅ إجبار الـ Observables على إعادة النشر
        }

        // التحقق من كود الحالة
        if (response.status === 200) {
          // حالة 200: توجيه إلى الصفحة الرئيسية
          this.toastr.success("تم تسجيل الدخول بنجاح");

          this.authService.checkRedirect();
          localStorage.removeItem('otp_code');

        } else if (response.status === 201) {

          this.toastr.success(response?.message);

          // حالة 201: توجيه إلى صفحة التسجيل مع إضافة البارامترات
          this.router.navigate(['Auth/IndividuaRegister'], {
            queryParams: {
              type: this.type,
              phone: this.phone,
            },
          });
          localStorage.removeItem('otp_code');

        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'رمز التحقق غير صحيح أو منتهي الصلاحية.';
        console.error('OTP verification error:', err);
      },
    });
  }
}