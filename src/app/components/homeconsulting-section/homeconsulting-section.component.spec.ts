import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeconsultingSectionComponent } from './homeconsulting-section.component';

describe('HomeconsultingSectionComponent', () => {
  let component: HomeconsultingSectionComponent;
  let fixture: ComponentFixture<HomeconsultingSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeconsultingSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeconsultingSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
