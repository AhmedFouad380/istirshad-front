import { Component } from '@angular/core';
import { MainHeaderContactComponent } from "../../components/main-header-contact/main-header-contact.component";
import { FormContactComponent } from "../../components/form-contact/form-contact.component";
import { LoadingComponent } from "../../shared/loading/loading.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact-us',
  imports: [
    MainHeaderContactComponent,
    FormContactComponent,
    LoadingComponent,
    CommonModule,
  ],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
  loading = true;

  constructor() {
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
