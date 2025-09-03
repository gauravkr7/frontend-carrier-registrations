import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoadTestFormComponent } from './road-test-form.component';

describe('RoadTestFormComponent', () => {
  let component: RoadTestFormComponent;
  let fixture: ComponentFixture<RoadTestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RoadTestFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RoadTestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
