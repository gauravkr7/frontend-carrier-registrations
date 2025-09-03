import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpiryviewComponent } from './expiryview.component';

describe('ExpiryviewComponent', () => {
  let component: ExpiryviewComponent;
  let fixture: ComponentFixture<ExpiryviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExpiryviewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExpiryviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
