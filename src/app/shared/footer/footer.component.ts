import { Component } from '@angular/core';
import { SettingsData, SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [CommonModule,RouterLink],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  settings: SettingsData | null = null;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.settings$.subscribe((data) => {
      if (data) this.settings = data;
    });
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
