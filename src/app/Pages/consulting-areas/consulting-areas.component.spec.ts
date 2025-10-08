import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultingAreasComponent } from './consulting-areas.component';

describe('ConsultingAreasComponent', () => {
  let component: ConsultingAreasComponent;
  let fixture: ComponentFixture<ConsultingAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultingAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultingAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
