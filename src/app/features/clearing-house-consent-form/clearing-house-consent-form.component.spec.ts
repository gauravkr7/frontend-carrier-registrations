import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClearingHouseConsentFormComponent } from './clearing-house-consent-form.component';

describe('ClearingHouseConsentFormComponent', () => {
  let component: ClearingHouseConsentFormComponent;
  let fixture: ComponentFixture<ClearingHouseConsentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClearingHouseConsentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClearingHouseConsentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
