import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentApplicationFormComponent } from './employment-application-form.component';

describe('EmploymentApplicationFormComponent', () => {
  let component: EmploymentApplicationFormComponent;
  let fixture: ComponentFixture<EmploymentApplicationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmploymentApplicationFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EmploymentApplicationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
