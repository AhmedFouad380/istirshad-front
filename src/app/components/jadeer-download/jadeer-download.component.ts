import { Component } from '@angular/core';
import { SettingsData, SettingsService } from '../../services/settings.service';

@Component({
  selector: 'app-jadeer-download',
  imports: [],
  templateUrl: './jadeer-download.component.html',
  styleUrl: './jadeer-download.component.css'
})
export class JadeerDownloadComponent {
  settings!: SettingsData;

  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.settingsService.settings$.subscribe((data) => {
      if (data) this.settings = data;
    });
  }
}
