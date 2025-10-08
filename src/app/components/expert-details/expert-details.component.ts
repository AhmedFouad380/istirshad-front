import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ConsultantService } from '../../services/consultant.service';
import { HttpClientModule } from '@angular/common/http';
import { LoadingComponent } from "../../shared/loading/loading.component";

@Component({
  selector: 'app-expert-details',
  standalone: true,
  imports: [CommonModule, HttpClientModule, LoadingComponent],
  templateUrl: './expert-details.component.html',
  styleUrl: './expert-details.component.css',
})
export class ExpertDetailsComponent implements OnInit {
  consultantId: number | null = null;
  consultant: any = null;
  isLoading: boolean = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private consultantService: ConsultantService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.consultantId = Number(params.get('id'));
      this.loadConsultantData(this.consultantId);
    });
  }

  loadConsultantData(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.consultantService.getConsultantProfile(id).subscribe({
      next: (response) => {
        this.consultant = response.data;

        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load consultant data. Please try again later.';
        this.isLoading = false;
        console.error('Error loading consultant data:', err);
      },
    });
  }

  getFullStars(rating: number): number {
    return Math.floor(rating);
  }

  hasHalfStar(rating: number): boolean {
    return rating % 1 >= 0.5;
  }

  getEmptyStars(rating: number): number {
    return 5 - Math.ceil(rating);
  }
  copyProfileLink(): void {
    const link = `${window.location.origin}/expert-details/${this.consultantId}`;

    // استخدام Web Share API إذا كان متاحًا
    if (navigator.share) {
      navigator
        .share({
          title: this.consultant?.consultant?.name || 'ملف خبير',
          text: 'شوف ملف الخبير ده',
          url: link,
        })
        .catch((err) => {
          console.error('Web Share failed:', err);
        });
    } else {
      // fallback: نسخ الرابط
      navigator.clipboard
        .writeText(link)
        .then(() => {
          alert('تم نسخ الرابط!');
        })
        .catch((err) => {
          console.error('فشل نسخ الرابط:', err);
        });
    }
  }
}
