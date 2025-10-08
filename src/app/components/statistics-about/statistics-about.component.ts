import { Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-statistics-about',
  imports: [],
  templateUrl: './statistics-about.component.html',
  styleUrl: './statistics-about.component.css',
})
export class StatisticsAboutComponent {
  @Input() statistics: any;
}
