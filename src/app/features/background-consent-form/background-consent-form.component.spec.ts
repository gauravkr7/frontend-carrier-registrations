import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackgroundConsentFormComponent } from './background-consent-form.component';

describe('BackgroundConsentFormComponent', () => {
  let component: BackgroundConsentFormComponent;
  let fixture: ComponentFixture<BackgroundConsentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BackgroundConsentFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BackgroundConsentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
