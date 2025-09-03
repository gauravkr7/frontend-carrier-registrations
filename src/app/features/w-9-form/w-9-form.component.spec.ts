import { ComponentFixture, TestBed } from '@angular/core/testing';

import { W9FormComponent } from './w-9-form.component';

describe('W9FormComponent', () => {
  let component: W9FormComponent;
  let fixture: ComponentFixture<W9FormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [W9FormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(W9FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
