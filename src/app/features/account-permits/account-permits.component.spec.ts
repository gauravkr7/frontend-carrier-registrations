import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountPermitsComponent } from './account-permits.component';

describe('AccountPermitsComponent', () => {
  let component: AccountPermitsComponent;
  let fixture: ComponentFixture<AccountPermitsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AccountPermitsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccountPermitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
