import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsultantService } from '../../services/consultant.service';
import { ReportService } from '../../services/report.service';
import { LoadingComponent } from "../../shared/loading/loading.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-consult-details',
  imports: [LoadingComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './consult-details.component.html',
  styleUrl: './consult-details.component.css',
})
export class ConsultDetailsComponent implements OnInit {
  isLoading = true;
  consultant: any;
  consultationId: string | null = null;
  isSubmitting = false;
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultantService,
    private reportService: ReportService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.consultationId = id;

    if (id) {
      this.consultationService.getConsultationDetails(id).subscribe({
        next: (res: any) => {
          this.consultant = res.data;

          this.isLoading = false;
        },
        error: (err) => {
          console.error('فشل في تحميل بيانات الاستشارة', err);
          this.isLoading = false;
        },
      });
    }
  }
  goToChat(id: number) {
    this.router.navigate(['/consultations_messages', id]);
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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  submitComplaint() {
    // Validation
    if (!this.complaintText.trim()) {
      this.toastr.warning('الرجاء كتابة نص الشكوى', 'تنبيه');
      return;
    }

    if (!this.consultationId) {
      this.toastr.error('معرف الاستشارة غير متوفر', 'خطأ');
      return;
    }

    this.isSubmitting = true;

    // Prepare FormData
    const formData = new FormData();
    formData.append('consultation_id', this.consultationId);
    formData.append('title', this.selectedReason);
    formData.append('description', this.complaintText);
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    // Send to API
    this.reportService.storeReport(formData).subscribe({
      next: (res: any) => {
        this.toastr.success('تم إرسال الشكوى بنجاح', 'نجاح');
        this.showComplaintModal = false;
        this.resetComplaintForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('فشل في إرسال الشكوى', err);
        this.isSubmitting = false;
      }
    });
  }

  resetComplaintForm() {
    this.selectedReason = 'أسباب أخرى';
    this.complaintText = '';
    this.selectedFile = null;
  }

  ratingOptions = [
    { value: 1, label: 'غير مفيد' },
    { value: 2, label: 'مفيد بعض الشيء' },
    { value: 3, label: 'مفيد' },
    { value: 4, label: 'مفيد جدا' },
    { value: 5, label: 'أرشحه للاصدقاء' },
  ];
}
