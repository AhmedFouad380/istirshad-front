import { Component } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CommonModule } from '@angular/common';
import { GradientSectionComponent } from './components/gradient-section/gradient-section.component';
import { ViewportScroller } from '@angular/common'; // ⭐ استورد ViewportScroller
import { SettingsService } from './services/settings.service';
import { Title } from '@angular/platform-browser';
import { LoadingComponent } from "./shared/loading/loading.component"; // 👑 استورد Title للتحكم في العنوان
import { HomeService } from './services/home.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    CommonModule,
    GradientSectionComponent,
    LoadingComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Gadeer';
  showNavbarAndFooter = true;
  showGradiantsSection = true;
  isLoading = false; // 👈 حالة التحميل

  constructor(
    private router: Router,
    private settingsService: SettingsService,
    private viewportScroller: ViewportScroller,
    private titleService: Title, // 💡 أضف الخدمة هنا
    private homeService: HomeService // ⬅️ هنا
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.isLoading = false;

        this.showNavbarAndFooter =
          !this.router.url.includes('Auth') &&
          !this.router.url.includes('call');

        this.showGradiantsSection = !(
          this.router.url.includes('Contact_us') ||
          this.router.url.includes('Auth') ||
          this.router.url.includes('profile') ||
          this.router.url.includes('call')
        );

        this.viewportScroller.scrollToPosition([0, 0]);
      }
    });
  }
  ngOnInit() {
    this.isLoading = true;

    this.homeService.getHomeData().subscribe({
      next: (data) => {
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error loading home data', err);
        this.isLoading = false;
      },
    });
    this.settingsService.loadSettings().subscribe({
      next: () => {
        this.isLoading = false;

        const settings = this.settingsService.currentSettings;
        if (settings?.favicon) {
          this.setFavicon(settings.favicon);
        }
        if (settings?.title) {
          this.titleService.setTitle(settings.title);
        }
      },
      error: (err) => {
        console.error('❌ Error loading settings', err);
        this.isLoading = false;
      },
    });
  }

  private setFavicon(faviconUrl: string) {
    if (typeof document !== 'undefined') {
      const link: HTMLLinkElement =
        document.querySelector("link[rel*='icon']") ||
        document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = faviconUrl;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }
}
