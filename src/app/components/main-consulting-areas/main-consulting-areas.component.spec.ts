import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainConsultingAreasComponent } from './main-consulting-areas.component';

describe('MainConsultingAreasComponent', () => {
  let component: MainConsultingAreasComponent;
  let fixture: ComponentFixture<MainConsultingAreasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainConsultingAreasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainConsultingAreasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
