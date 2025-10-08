import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-header-about',
  imports: [],
  templateUrl: './header-about.component.html',
  styleUrl: './header-about.component.css',
})
export class HeaderAboutComponent {
  @Input() data: any;
}
