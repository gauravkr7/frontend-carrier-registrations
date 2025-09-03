import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HosServiceRecordComponent } from './hos-service-record.component';

describe('HosServiceRecordComponent', () => {
  let component: HosServiceRecordComponent;
  let fixture: ComponentFixture<HosServiceRecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HosServiceRecordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HosServiceRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
