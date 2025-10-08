import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividuaRegisterComponent } from './individua-register.component';

describe('IndividuaRegisterComponent', () => {
  let component: IndividuaRegisterComponent;
  let fixture: ComponentFixture<IndividuaRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividuaRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IndividuaRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
