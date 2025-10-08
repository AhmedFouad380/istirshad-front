import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-partners-section',
  imports: [CommonModule, CarouselModule],
  templateUrl: './partners-section.component.html',
  styleUrl: './partners-section.component.css',
})
export class PartnersSectionComponent {
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
