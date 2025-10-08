import { Component } from '@angular/core';
import { MainConsultingAreasComponent } from "../../components/main-consulting-areas/main-consulting-areas.component";
import { ConsultingAreasDataComponent } from "../../components/consulting-areas-data/consulting-areas-data.component";
import { LoadingComponent } from "../../shared/loading/loading.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-consulting-areas',
  imports: [MainConsultingAreasComponent, ConsultingAreasDataComponent,CommonModule],
  templateUrl: './consulting-areas.component.html',
  styleUrl: './consulting-areas.component.css'
})
export class ConsultingAreasComponent {

}
