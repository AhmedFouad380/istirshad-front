import { Component, OnInit } from '@angular/core';
import { AuthComponent } from "../auth/auth.component";
import { JadeerDownloadComponent } from "../../components/jadeer-download/jadeer-download.component";
import { JadeerFeaturesComponent } from "../../components/jadeer-features/jadeer-features.component";
import { FeaturedExpertsComponent } from "../../components/featured-experts/featured-experts.component";
import { HeaderAboutComponent } from "../../components/header-about/header-about.component";
import { HomeAboutComponent } from "../../components/home-about/home-about.component";
import { HomeMainComponent } from "../../components/home-main/home-main.component";
import { HomeconsultingSectionComponent } from "../../components/homeconsulting-section/homeconsulting-section.component";
import { CommonModule } from '@angular/common';
import { LoadingComponent } from "../../shared/loading/loading.component";
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-home',
  imports: [
    JadeerDownloadComponent,
    JadeerFeaturesComponent,
    FeaturedExpertsComponent,
    HomeAboutComponent,
    HomeMainComponent,
    CommonModule,
    HomeconsultingSectionComponent,
    LoadingComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  loading = true;
  homeData: any;

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.homeService.getHomeData().subscribe({
      next: (res) => {
        if (res.status === 200) {
          this.homeData = res.data;
          console.log('تم جلب بيانات الهوم بنجاح:', this.homeData);

        }
        this.loading = false;
      },
      error: (err) => {
        console.error('فشل جلب بيانات الهوم:', err);
        this.loading = false;
      },
    });
  }
}
