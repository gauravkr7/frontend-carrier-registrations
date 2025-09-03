import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I9FormComponent } from './i-9-form.component';

describe('I9FormComponent', () => {
  let component: I9FormComponent;
  let fixture: ComponentFixture<I9FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [I9FormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(I9FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
