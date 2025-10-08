import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedExpertsComponent } from './featured-experts.component';

describe('FeaturedExpertsComponent', () => {
  let component: FeaturedExpertsComponent;
  let fixture: ComponentFixture<FeaturedExpertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturedExpertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturedExpertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
