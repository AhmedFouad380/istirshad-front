import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-homeconsulting-section',
  imports: [CarouselModule,RouterLink,CommonModule],
  templateUrl: './homeconsulting-section.component.html',
  styleUrl: './homeconsulting-section.component.css',
})
export class HomeconsultingSectionComponent {
  @Input() partners: { image: string; title: string }[] = [];

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '600px',
      numVisible: 1,
      numScroll: 1,
    },
  ];
}
