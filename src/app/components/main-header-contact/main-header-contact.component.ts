import { Component } from '@angular/core';
import { SettingsData, SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-main-header-contact',
  imports: [],
  templateUrl: './main-header-contact.component.html',
  styleUrl: './main-header-contact.component.css'
})
export class MainHeaderContactComponent {
  settings!: SettingsData;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.settings$.subscribe((data) => {
      if (data) this.settings = data;
    });
  }
}
