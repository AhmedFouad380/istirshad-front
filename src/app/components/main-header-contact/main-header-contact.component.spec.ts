import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainHeaderContactComponent } from './main-header-contact.component';

describe('MainHeaderContactComponent', () => {
  let component: MainHeaderContactComponent;
  let fixture: ComponentFixture<MainHeaderContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainHeaderContactComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainHeaderContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
