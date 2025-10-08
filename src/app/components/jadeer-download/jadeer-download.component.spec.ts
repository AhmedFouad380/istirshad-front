import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JadeerDownloadComponent } from './jadeer-download.component';

describe('JadeerDownloadComponent', () => {
  let component: JadeerDownloadComponent;
  let fixture: ComponentFixture<JadeerDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JadeerDownloadComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JadeerDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
