import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-expensedetails',
  templateUrl: './expensedetails.component.html',
  styleUrls: ['./expensedetails.component.css']
})
export class ExpensedetailsComponent implements OnInit {
  isSidebarOpen: boolean = false;
  expenses: any[] = [];
  filteredExpenseOrders: any[] = [];
  selectedExpense: any = null;

  constructor(private http: HttpClient, private accountingService: ServiceAuthService ,   private route: ActivatedRoute,
   ) {}
   ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const expenseId = params.get('expenseId');
      if (expenseId) {
        this.fetchExpenseDetails(expenseId);
      }
    });
  }
  
  loadExpenseData(): void {
    this.accountingService.getExpensePermitFromAPI().subscribe(
      (data: any) => {
        this.expenses = Array.isArray(data) ? data : [];
      },
      (error) => {
        console.error('Error fetching expense data:', error);
      }
    );
  }
  selectExpense(expenseId: string): void {
    this.selectedExpense = this.expenses.find(
      (expense) => expense.expenseId === expenseId
    );
    if (this.selectedExpense) {
      // Ensure uploadDocument is an array
      this.selectedExpense.uploadDocument = Array.isArray(this.selectedExpense.uploadDocument)
        ? this.selectedExpense.uploadDocument
        : (this.selectedExpense.uploadDocument ? [this.selectedExpense.uploadDocument] : []);
      // Ensure categories is an array
      this.selectedExpense.categories = Array.isArray(this.selectedExpense.categories)
        ? this.selectedExpense.categories
        : (this.selectedExpense.categories ? [this.selectedExpense.categories] : []);
      console.log('Selected Expense:', this.selectedExpense);
    } else {
      console.warn(`Expense with ID ${expenseId} not found.`);
    }
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar state:', this.isSidebarOpen);
  }
  fetchExpenseDetails(expenseId: string): void {
    console.log('Fetching details for expenseId:', expenseId);
    if (this.expenses.length === 0) {
      this.accountingService.getExpensePermitFromAPI().subscribe(
        (data: any) => {
          this.expenses = Array.isArray(data) ? data : [];
          this.selectedExpense = this.expenses.find((expense: any) => expense.expenseId === expenseId);
          // Ensure uploadDocument and categories are arrays
          if (this.selectedExpense) {
            this.selectedExpense.uploadDocument = Array.isArray(this.selectedExpense.uploadDocument)
              ? this.selectedExpense.uploadDocument
              : (this.selectedExpense.uploadDocument ? [this.selectedExpense.uploadDocument] : []);
            this.selectedExpense.categories = Array.isArray(this.selectedExpense.categories)
              ? this.selectedExpense.categories
              : (this.selectedExpense.categories ? [this.selectedExpense.categories] : []);
          }
          console.log('Selected Expense:', this.selectedExpense);
        },
        (error) => {
          console.error('Error fetching expense details:', error);
        }
      );
    } else {
      this.selectedExpense = this.expenses.find((expense: any) => expense.expenseId === expenseId);
      if (this.selectedExpense) {
        this.selectedExpense.uploadDocument = Array.isArray(this.selectedExpense.uploadDocument)
          ? this.selectedExpense.uploadDocument
          : (this.selectedExpense.uploadDocument ? [this.selectedExpense.uploadDocument] : []);
        this.selectedExpense.categories = Array.isArray(this.selectedExpense.categories)
          ? this.selectedExpense.categories
          : (this.selectedExpense.categories ? [this.selectedExpense.categories] : []);
      }
      console.log('Selected Expense:', this.selectedExpense);
    }
  }
  fetchUploadedDocuments(expenseId: string): void {
    const formData = new FormData();
    formData.append('expenseId', expenseId);
    this.accountingService.ExpenseuploadDocument(formData).subscribe(
      (documents: any[]) => {
        if (this.selectedExpense) {
          this.selectedExpense.uploadDocument = documents.map((doc) => doc.url); // Assuming the API returns document URLs
        }
      },
      (error) => {
        console.error('Error fetching uploaded documents:', error);
      }
    );
  }

  get expenseUploadDocumentList(): string[] {
    const doc = this.selectedExpense?.expenseUploadDocument;
    if (!doc) return [];
    if (Array.isArray(doc)) {
      // Map objects to URLs if needed
      return doc.map((item: any) =>
        typeof item === 'string'
          ? item
          : (item?.url || item?.path || item?.filename || '')
      ).filter((url: string) => !!url);
    }
    return [typeof doc === 'string' ? doc : (doc?.url || doc?.path || doc?.filename || '')];
  }
}
