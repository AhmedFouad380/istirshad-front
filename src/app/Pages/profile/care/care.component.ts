import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReportService } from '../../../services/report.service';
import { SettingsData, SettingsService } from '../../../services/settings.service';

@Component({
  selector: 'app-care',
  imports: [CommonModule],
  templateUrl: './care.component.html',
  styleUrl: './care.component.css',
})
export class CareComponent {
  reports: any[] = [];

  constructor(
    private reportService: ReportService,
    private settingsService: SettingsService
  ) {}
  settings!: SettingsData;

  ngOnInit() {
    this.fetchReports();
    this.settingsService.settings$.subscribe((data) => {
      if (data) this.settings = data;
    });
  }

  fetchReports() {
    this.reportService.getReportList().subscribe({
      next: (res) => {
        this.reports = res?.data?.data || [];
      },
      error: (err) => {
        console.error('فشل تحميل التقارير:', err.message);
      },
    });
  }
}
