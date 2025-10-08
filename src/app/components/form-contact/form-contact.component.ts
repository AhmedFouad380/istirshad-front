import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ContactService } from '../../services/contact.service';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-contact',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './form-contact.component.html',
  styleUrls: ['./form-contact.component.css'],
})
export class FormContactComponent implements OnInit {
  contactForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^05\d{8}$/), // رقم سعودي يبدأ بـ 05 ويتبعه 8 أرقام
        ],
      ],
      requestType: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.toastr.error('من فضلك املأ الحقول بشكل صحيح', 'خطأ في الإدخال');
      this.contactForm.markAllAsTouched();
      return;
    }

    const formValue = this.contactForm.value;
    const payload = {
      name: formValue.fullName,
      email: formValue.email,
      phone: formValue.phone,
      message: formValue.message,
      type: formValue.requestType,
    };

    this.contactService.sendContactForm(payload).subscribe({
      next: () => {
        this.toastr.success('تم إرسال رسالتك بنجاح 🎉', 'تم بنجاح');
        this.contactForm.reset();
      },
      error: () => {
        this.toastr.error(
          'حدث خطأ أثناء الإرسال، حاول مرة أخرى',
          'فشل الإرسال'
        );
      },
    });
  }

  isInvalid(controlName: string): boolean {
    const control = this.contactForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }
}
