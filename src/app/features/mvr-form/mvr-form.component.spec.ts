import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MvrFormComponent } from './mvr-form.component';

describe('MvrFormComponent', () => {
  let component: MvrFormComponent;
  let fixture: ComponentFixture<MvrFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MvrFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MvrFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
