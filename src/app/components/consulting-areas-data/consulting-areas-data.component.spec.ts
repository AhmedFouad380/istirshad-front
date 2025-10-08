import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultingAreasDataComponent } from './consulting-areas-data.component';

describe('ConsultingAreasDataComponent', () => {
  let component: ConsultingAreasDataComponent;
  let fixture: ComponentFixture<ConsultingAreasDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultingAreasDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultingAreasDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
