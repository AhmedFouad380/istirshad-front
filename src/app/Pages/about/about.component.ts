import { Component } from '@angular/core';
import { HeaderAboutComponent } from "../../components/header-about/header-about.component";
import { AboutSectionComponent } from "../../components/about-section/about-section.component";
import { StatisticsAboutComponent } from "../../components/statistics-about/statistics-about.component";
import { PartnersSectionComponent } from "../../components/partners-section/partners-section.component";
import { LoadingComponent } from "../../shared/loading/loading.component";
import { CommonModule } from '@angular/common';
import { AboutService } from '../../services/about.service';

@Component({
  selector: 'app-about',
  imports: [
    HeaderAboutComponent,
    AboutSectionComponent,
    StatisticsAboutComponent,
    CommonModule,
    PartnersSectionComponent,
    LoadingComponent,
  ],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent {
  loading = true;
  aboutData: any;

  constructor(private aboutService: AboutService) {}

  ngOnInit() {
    this.aboutService.getAboutData().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.aboutData = res.data;
          
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching about data:', err);
        this.loading = false;
      },
    });
  }

}
