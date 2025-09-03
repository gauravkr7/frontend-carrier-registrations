import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExpensedetailsComponent } from './expensedetails.component';
import { ServiceAuthService } from '../../service/service-auth.service';
import { of } from 'rxjs';

describe('ExpensedetailsComponent', () => {
  let component: ExpensedetailsComponent;
  let fixture: ComponentFixture<ExpensedetailsComponent>;
  let mockServiceAuthService: jasmine.SpyObj<ServiceAuthService>;

  beforeEach(async () => {
    mockServiceAuthService = jasmine.createSpyObj('ServiceAuthService', ['getExpensePermitFromAPI']);
    mockServiceAuthService.getExpensePermitFromAPI.and.returnValue(of([])); // Mock API response

    await TestBed.configureTestingModule({
      declarations: [ExpensedetailsComponent],
      imports: [HttpClientTestingModule],
      providers: [{ provide: ServiceAuthService, useValue: mockServiceAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ExpensedetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load expense data on initialization', () => {
    component.ngOnInit();
    expect(mockServiceAuthService.getExpensePermitFromAPI).toHaveBeenCalled();
  });

  it('should select an expense by ID', () => {
    component.expenses = [{ expenseId: 'EXP53454', vendorName: 'Vendor A' }];
    component.selectExpense('EXP53454');
    expect(component.selectedExpense).toEqual({ expenseId: 'EXP53454', vendorName: 'Vendor A' });
  });
});
