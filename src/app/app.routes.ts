import { Routes } from '@angular/router';
import { HomeComponent } from './Pages/home/home.component';
import { AboutComponent } from './Pages/about/about.component';
import { AuthComponent } from './Pages/auth/auth.component';
import { IndividualoginComponent } from './Pages/auth/individualogin/individualogin.component';
import { IndividuaRegisterComponent } from './Pages/auth/individua-register/individua-register.component';
import { ConsultingAreasComponent } from './Pages/consulting-areas/consulting-areas.component';
import { ConsultingAreasDetailsComponent } from './components/consulting-areas-details/consulting-areas-details.component';
import { ExpertDetailsComponent } from './components/expert-details/expert-details.component';
import { FqaComponent } from './Pages/fqa/fqa.component';
import { ContactUsComponent } from './Pages/contact-us/contact-us.component';
import { ProfileComponent } from './Pages/profile/profile.component';
import { ConsultationsComponent } from './Pages/profile/consultations/consultations.component';
import { PersonalComponent } from './Pages/profile/personal/personal.component';
import { CareComponent } from './Pages/profile/care/care.component';
import { ChatComponent } from './Pages/profile/chat/chat.component';
import { VerifyOtpComponent } from './Pages/auth/verify-otp/verify-otp.component';
import { ConsultationsExpertComponent } from './Pages/profile/consultationsExpert/consultationsExpert.component';
import { ConsultDetailsComponent } from './Pages/consult-details/consult-details.component';
import { CallingComponent } from './components/calling/calling.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'FQA', component: FqaComponent },
  { path: 'Consulting_areas', component: ConsultingAreasComponent },
  { path: 'Consulting_areas/:id', component: ConsultingAreasDetailsComponent },
  { path: 'Contact_us', component: ContactUsComponent },
  { path: 'expert/:id', component: ExpertDetailsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'Auth', component: AuthComponent },
  { path: 'Auth/Individual_login', component: IndividualoginComponent },
  { path: 'Auth/verify-otp', component: VerifyOtpComponent },
  { path: 'Auth/IndividuaRegister', component: IndividuaRegisterComponent },
  { path: 'ConsultDetails/:id', component: ConsultDetailsComponent },
  { path: 'consultations_messages/:id', component: ChatComponent },
  { path: 'call/:roomID', component: CallingComponent }, // أضفنا دي

  {
    path: 'profile',
    component: ProfileComponent,
    children: [
      { path: '', redirectTo: 'personal', pathMatch: 'full' },
      { path: 'personal', component: PersonalComponent },
      { path: 'consultations', component: ConsultationsComponent },
      { path: 'expert/consultations', component: ConsultationsExpertComponent },
      { path: 'care', component: CareComponent },
    ],
  },

  { path: '**', redirectTo: '' },
];