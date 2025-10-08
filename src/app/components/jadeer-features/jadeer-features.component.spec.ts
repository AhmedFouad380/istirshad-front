import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JadeerFeaturesComponent } from './jadeer-features.component';

describe('JadeerFeaturesComponent', () => {
  let component: JadeerFeaturesComponent;
  let fixture: ComponentFixture<JadeerFeaturesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JadeerFeaturesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JadeerFeaturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
