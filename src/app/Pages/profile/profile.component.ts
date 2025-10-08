import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  userData: any = null;

  ngOnInit(): void {
    const storedData = localStorage.getItem('user');
    if (storedData) {
      this.userData = JSON.parse(storedData);
    }
  }
  isInMessages(): boolean {
    return this.router.url.includes('/consultations_messages');
  }
  constructor(public router: Router, private authService: AuthService) {}
  sidebarOpen = false;

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }
  logout() {
    this.authService.logout(); // هذا وحده كافٍ الآن
  }
}
