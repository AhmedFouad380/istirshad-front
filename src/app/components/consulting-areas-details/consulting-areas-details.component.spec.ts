import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultingAreasDetailsComponent } from './consulting-areas-details.component';

describe('ConsultingAreasDetailsComponent', () => {
  let component: ConsultingAreasDetailsComponent;
  let fixture: ComponentFixture<ConsultingAreasDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultingAreasDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultingAreasDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
