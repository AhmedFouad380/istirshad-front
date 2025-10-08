import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradientSectionComponent } from './gradient-section.component';

describe('GradientSectionComponent', () => {
  let component: GradientSectionComponent;
  let fixture: ComponentFixture<GradientSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradientSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradientSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
