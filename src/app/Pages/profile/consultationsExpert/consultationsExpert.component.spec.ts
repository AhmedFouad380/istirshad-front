import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultationsExpertComponent } from './consultationsExpert.component';


describe('ConsultationsExpertComponent', () => {
  let component: ConsultationsExpertComponent;
  let fixture: ComponentFixture<ConsultationsExpertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationsExpertComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationsExpertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
