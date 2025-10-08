import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsultationsService } from '../../../services/consultations.service';
import { Router } from '@angular/router';
import { LoadingComponent } from "../../../shared/loading/loading.component";

@Component({
  selector: 'app-consultations',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './consultations.component.html',
  styleUrls: ['./consultations.component.css'],
})
export class ConsultationsComponent implements OnInit {
  activeTab: 'pending' | 'accepted' | 'completed' = 'pending';
  consultations: any[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private consultationsService: ConsultationsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchConsultations();
  }

  fetchConsultations() {
    this.loading = true;
    this.error = null;
    this.consultationsService.getConsultationsByType(this.activeTab).subscribe({
      next: (response) => {
        this.consultations = response?.data?.data;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
        console.error('Error fetching consultations:', error);
      },
    });
  }
  getStarsArray(rate: number): string[] {
    const fullStars = Math.floor(rate);
    const hasHalfStar = rate % 1 >= 0.25 && rate % 1 < 0.75;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = Array(fullStars).fill('★');

    if (hasHalfStar) {
      stars.push('⯨'); // أو أي رمز/SVG للنص
    }

    return stars.concat(Array(emptyStars).fill('☆'));
  }
  

  changeTab(tab: 'pending' | 'accepted' | 'completed') {
    this.activeTab = tab;
    this.fetchConsultations();
  }
  goToChat(id: number) {
    this.router.navigate(['/ConsultDetails', id]);
  }
  getTypeLabel(type: string): string {
    switch (type) {
      case 'pending':
        return 'قيد الانتظار ';
      case 'accepted':
        return 'استشارة جارية';
      case 'completed':
        return 'استشارة منتهية';
      default:
        return 'غير معروف';
    }
  }

  getStatusText(status: string) {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'accepted':
        return 'جاري';
      case 'completed':
        return 'منتهية';
      default:
        return status;
    }
  }
}
