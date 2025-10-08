import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { InputsComponent } from "../../../shared/inputs/inputs.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-individualogin',
  standalone: true,
  imports: [CommonModule,  ReactiveFormsModule, InputsComponent],
  templateUrl: './individualogin.component.html',
  styleUrls: ['./individualogin.component.css'],
})
export class IndividualoginComponent implements OnInit {
  type: string = 'individual';
  loginForm: FormGroup;
  isLoading: boolean = false;
  errorMessage: string | null = null;
  phoneRegex = /^966[0-9]{9}$/; // 966 متبوعًا بـ 9 أرقام (12 رقمًا كامل)
  submitted: boolean = false;
  fixedPrefix = '966'; // البادئة الثابتة

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      phone: [
        '966',
        [
          // القيمة الابتدائية 966
          Validators.required,
          Validators.pattern(this.phoneRegex),
          Validators.minLength(12), // 12 رقمًا كاملًا
        ],
      ],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.type = params['type'] || 'individual';
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const phone = this.loginForm.value.phone;

    this.authService.sendOtp(phone, this.type).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastr.success("تم إرسال رمز التحقق إلى رقم جوالك ");
        const code = response?.data; // تأكد إن ده الكود الفعلي

        if (code) {
          localStorage.setItem('otp_code', code); // 👈 خزّنه في localStorage
        }
        this.router.navigate(['/Auth/verify-otp'], {
          queryParams: { phone, type: this.type },
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'فشل إرسال الرمز. الرجاء المحاولة مرة أخرى.';
        console.error('Login error:', err);
      },
    });
  }
}