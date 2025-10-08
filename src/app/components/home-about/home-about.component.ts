import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home-about',
  imports: [RouterLink,CommonModule],
  templateUrl: './home-about.component.html',
  styleUrl: './home-about.component.css',
})
export class HomeAboutComponent {
  @Input() values: any[] = []; // البيانات اللي هنستقبلها من الـ Parent
}
