import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldsSectionComponent } from './fields-section.component';

describe('FieldsSectionComponent', () => {
  let component: FieldsSectionComponent;
  let fixture: ComponentFixture<FieldsSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldsSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FieldsSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
