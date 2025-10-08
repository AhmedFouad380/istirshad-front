import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-featured-experts',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './featured-experts.component.html',
  styleUrls: ['./featured-experts.component.css'],
})
export class FeaturedExpertsComponent {
  @Input() experts: any[] = [];

  currentIndex = 0;

  next() {
    if (this.experts.length <= 3) return;

    if (this.currentIndex + 3 >= this.experts.length) {
      this.currentIndex = 0; // أول السطر
    } else {
      this.currentIndex++;
    }
  }
  ngOnInit() {
    setInterval(() => this.next(), 3000); // كل 3 ثواني
  }

  prev() {
    if (this.experts.length <= 3) return;

    if (this.currentIndex === 0) {
      this.currentIndex = this.experts.length - 3; // آخر مجموعة
    } else {
      this.currentIndex--;
    }
  }

  getVisibleExperts(): any[] {
    return this.experts.slice(this.currentIndex, this.currentIndex + 3);
  }

  getExpertRating(rate: number): number {
    return Math.round(rate || 0);
  }

  getTags(categories: any[]): string[] {
    return categories?.map((cat) => cat.title) || [];
  }
  getFullStars(rate: number): number[] {
    return Array(Math.floor(rate)).fill(0);
  }

  hasHalfStar(rate: number): boolean {
    return rate % 1 >= 0.25 && rate % 1 <= 0.75;
  }

  getEmptyStars(rate: number): number[] {
    const full = Math.floor(rate);
    const half = this.hasHalfStar(rate) ? 1 : 0;
    return Array(5 - full - half).fill(0);
  }
}
