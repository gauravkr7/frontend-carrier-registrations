import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnualReviewFromComponent } from './annual-review-from.component';

describe('AnnualReviewFromComponent', () => {
  let component: AnnualReviewFromComponent;
  let fixture: ComponentFixture<AnnualReviewFromComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AnnualReviewFromComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnnualReviewFromComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
