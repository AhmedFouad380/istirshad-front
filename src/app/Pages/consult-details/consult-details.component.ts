import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConsultantService } from '../../services/consultant.service';
import { LoadingComponent } from "../../shared/loading/loading.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-consult-details',
  imports: [LoadingComponent, CommonModule, RouterLink, FormsModule],
  templateUrl: './consult-details.component.html',
  styleUrl: './consult-details.component.css',
})
export class ConsultDetailsComponent implements OnInit {
  isLoading = true;
  consultant: any;

  constructor(
    private route: ActivatedRoute,
    private consultationService: ConsultantService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

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
}
