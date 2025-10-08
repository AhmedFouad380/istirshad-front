import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { CategoriesService } from '../../services/categories.service';
import { HttpClientModule } from '@angular/common/http';
import { InputsComponent } from "../../shared/inputs/inputs.component";
import { ConsultationsService } from '../../services/consultations.service';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { LoadingComponent } from "../../shared/loading/loading.component";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-consulting-areas-details',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, FormsModule, LoadingComponent],
  templateUrl: './consulting-areas-details.component.html',
  styleUrl: './consulting-areas-details.component.css',
})
export class ConsultingAreasDetailsComponent implements OnInit {
  categoryId: number | null = null;
  categoryDetails: any = null;
  consultants: any[] = [];
  selectedExperts: any[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  isModalOpen = false;

  constructor(
    private route: ActivatedRoute,
    private categoriesService: CategoriesService,
    private router: Router, // أضف هذا
    private toaster: ToastrService, // أضف هذا
    private consultationsService: ConsultationsService // أضف هذا
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.categoryId = Number(params.get('id'));
      if (this.categoryId) {
        this.loadCategoryDetails(this.categoryId);
      }
    });
  }

  loadCategoryDetails(id: number): void {
    this.isLoading = true;
    this.error = null;

    this.categoriesService.getCategoryDetails(id).subscribe({
      next: (response) => {
        this.categoryDetails = response.data.category;
        this.consultants = response.data.consultants.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load category details. Please try again later.';
        this.isLoading = false;
        console.error('Error loading category details:', err);
      },
    });
  }
  isSubmitting: boolean = false;
  consultationTitle: string = '';
  consultationDescription: string = '';
  submitConsultation(): void {
    if (
      !this.consultationTitle ||
      !this.consultationDescription ||
      this.selectedExperts.length === 0
    ) {
      this.toaster.error('برجاء ادخال جميع البيانات');
      return;
    }
    this.isSubmitting = true; // يبدأ اللودينج

    const formData = {
      title: this.consultationTitle,
      description: this.consultationDescription,
      category_id: this.categoryId,
      consultants: this.selectedExperts.map((expert) => expert.id),
    };

    this.consultationsService.storeConsultation(formData).subscribe({
      next: (response) => {
        this.closeModal();
        this.selectedExperts = [];
        this.toaster.success('برجاء ادخال جميع البيانات');
      },
      error: (err) => {
        if (err.status === 401) {
          localStorage.setItem('redirectUrl', this.router.url);
          this.router.navigate(['/Auth/Individual_login']);
        }
      },
      complete: () => {
        this.isSubmitting = false; // يوقف اللودينج بعد الانتهاء
      },
    });
  }

  toggleExpert(expert: any) {
    const index = this.selectedExperts.findIndex(
      (e) => e && e.id === expert.id
    );

    if (index !== -1) {
      this.selectedExperts.splice(index, 1);
    } else {
      if (this.selectedExperts.length < 5) {
        this.selectedExperts.push(expert);
      }
    }
  }

  isSelected(expert: any): boolean {
    return this.selectedExperts.some((e) => e && e.id === expert.id);
  }

  getSelectedCount(): number {
    return this.selectedExperts.filter((e) => e !== null).length;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
