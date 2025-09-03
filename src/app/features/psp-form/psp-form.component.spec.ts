import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PspFormComponent } from './psp-form.component';

describe('PspFormComponent', () => {
  let component: PspFormComponent;
  let fixture: ComponentFixture<PspFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PspFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PspFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
