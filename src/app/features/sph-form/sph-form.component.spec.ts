import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SphFormComponent } from './sph-form.component';

describe('SphFormComponent', () => {
  let component: SphFormComponent;
  let fixture: ComponentFixture<SphFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SphFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SphFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
