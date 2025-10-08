import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { SettingsData, SettingsService } from '../../services/settings.service';
import { NotificationService } from '../../services/Notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isLoggedIn = false;
  userImage: string | null = null;
  user: any;
  settings!: SettingsData;
  isMenuOpen = false;
  authSub!: Subscription;
  userSub!: Subscription;
  notifications: any[] = [];
  showNotifications = false;
  notidicationsData: any;
  @ViewChild('notificationBox') notificationBox!: ElementRef;
  @ViewChild('notificationBoxDEs') notificationBoxDEs!: ElementRef;
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const clickedInside = this.notificationBox?.nativeElement.contains(
      event.target
    );
    const clickedInsidenotificationBoxDEs =
      this.notificationBoxDEs?.nativeElement.contains(event.target);
    if (!clickedInside && !clickedInsidenotificationBoxDEs) {
      this.showNotifications = false;
    }
  }
  constructor(
    public router: Router,
    private authService: AuthService,
    private settingsService: SettingsService,
    private notificationService: NotificationService
  ) {}
  ngOnInit(): void {
  this.notificationService.messages$.subscribe((messages) => {
    this.notidicationsData = messages;
  });
    this.settingsService.settings$.subscribe((data) => {
      if (data) this.settings = data;
    });
    this.authSub = this.authService.isLoggedIn$.subscribe((status) => {
      this.isLoggedIn = status;
    });
    this.userSub = this.authService.user$.subscribe((userData) => {
      this.user = userData;
      this.userImage = userData?.image || 'assets/images/Ellipse 4.png';
    });
    window.addEventListener('storage', () => this.authService.forceRefresh());
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
    this.userSub?.unsubscribe();
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 50;
  }

  get isExpertPage(): boolean {
    return (
      this.router.url.startsWith('/expert') ||
      this.router.url.startsWith('/FQA')
    );
  }

  get isProfileOrHomePage(): boolean {
    return (
      this.router.url === '/' ||
      this.router.url.startsWith('/profile') ||
      this.router.url.startsWith('/ConsultDetails') ||
      this.router.url.startsWith('/consultations_messages') ||
      this.router.url.startsWith('/FQA') ||
      this.router.url.startsWith('/about')
    );
  }

  goToProfile(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/profile']);
    } else {
      this.goToLogin();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/Auth']);
  }

  goToDownload(): void {
    const downloadId = 'downloadSection';

    if (this.router.url !== '/') {
      // لو مش على الصفحة الرئيسية، نروح ليها ونستنى بعدها نعمل سكرول
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const element = document.getElementById(downloadId);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500); // ⏱️ ننتظر شوية عشان الصفحة تكون خلصت تحميل
      });
    } else {
      // لو إحنا بالفعل على الصفحة الرئيسية
      const element = document.getElementById(downloadId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // قفل المينيو في وضع الموبايل
    this.closeMenu();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}
