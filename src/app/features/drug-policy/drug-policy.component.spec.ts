import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrugPolicyComponent } from './drug-policy.component';

describe('DrugPolicyComponent', () => {
  let component: DrugPolicyComponent;
  let fixture: ComponentFixture<DrugPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DrugPolicyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DrugPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
