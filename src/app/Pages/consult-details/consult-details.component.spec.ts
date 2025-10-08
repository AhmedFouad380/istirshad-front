import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultDetailsComponent } from './consult-details.component';

describe('ConsultDetailsComponent', () => {
  let component: ConsultDetailsComponent;
  let fixture: ComponentFixture<ConsultDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
