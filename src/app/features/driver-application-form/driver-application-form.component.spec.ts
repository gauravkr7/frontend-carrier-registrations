import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverApplicationFormComponent } from './driver-application-form.component';

describe('DriverApplicationFormComponent', () => {
  let component: DriverApplicationFormComponent;
  let fixture: ComponentFixture<DriverApplicationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DriverApplicationFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
