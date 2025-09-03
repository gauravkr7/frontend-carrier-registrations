import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DriverApplicationViewComponent } from './driver-application-view.component';

describe('DriverApplicationViewComponent', () => {
  let component: DriverApplicationViewComponent;
  let fixture: ComponentFixture<DriverApplicationViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DriverApplicationViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DriverApplicationViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
