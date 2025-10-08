import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FQAComponent } from './fqa.component';

describe('FQAComponent', () => {
  let component: FQAComponent;
  let fixture: ComponentFixture<FQAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FQAComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FQAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
