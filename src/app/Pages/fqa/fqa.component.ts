// src/app/components/fqa/fqa.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FAQItem, FQAService } from '../../services/faq.service';
import { LoadingComponent } from "../../shared/loading/loading.component";

@Component({
  selector: 'app-fqa',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './fqa.component.html',
  styleUrls: ['./fqa.component.css'],
})
export class FqaComponent implements OnInit {
  openIndex: number | null = null;
  faqs: FAQItem[] = [];
  isLoading: boolean = true;
  error: string | null = null;

  constructor(private fqaService: FQAService) {}

  ngOnInit(): void {
    this.loadFAQs();
  }

  loadFAQs(): void {
    this.isLoading = true;
    this.error = null;

    this.fqaService.getFQA().subscribe({
      next: (response) => {
        this.faqs = response.data.data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error =
          'فشل تحميل الأسئلة الشائعة. يرجى المحاولة مرة أخرى لاحقًا.';
        this.isLoading = false;
        console.error('Error loading FAQs:', err);
      },
    });
  }

  toggle(index: number): void {
    this.openIndex = this.openIndex === index ? null : index;
  }
}
