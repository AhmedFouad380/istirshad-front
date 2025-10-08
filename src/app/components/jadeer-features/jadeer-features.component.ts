import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jadeer-features',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './jadeer-features.component.html',
  styleUrls: ['./jadeer-features.component.css'],
})
export class JadeerFeaturesComponent {
  @Input() features: any[] = [];

  get halfLength(): number {
    return Math.ceil(this.features.length / 2);
  }

  get leftFeatures(): any[] {
    return this.features.slice(0, this.halfLength);
  }

  get rightFeatures(): any[] {
    return this.features.slice(this.halfLength);
  }
}
