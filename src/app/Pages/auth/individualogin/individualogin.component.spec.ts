import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualoginComponent } from './individualogin.component';

describe('IndividualoginComponent', () => {
  let component: IndividualoginComponent;
  let fixture: ComponentFixture<IndividualoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividualoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividualoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
