import { Component, OnInit, Renderer2 } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormArray,
  FormControl,
} from '@angular/forms';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SharedUtilityService } from '../../shared/shared-utility.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-account-permits',
  templateUrl: './account-permits.component.html',
  styleUrls: ['./account-permits.component.css'],
})
export class AccountPermitsComponent implements OnInit {
  expenseSearchTerm: string = '';
  salesOrderSearchTerm: string = '';
  accountSearchTerm: string = '';
  bankOptions: string[] = [];
  showFilters: boolean = false;
  showServiceOptions = false;
  showVendorOptions: boolean = false; // Property to track the visibility of vendor options
  dueThisWeekAP: any;
  paidThisMonthAP: any;
  currentSalesPage: any;
  salesPageSize: any;
  totalSalesPages: any;
  existingDocumentUrl: any;
  isLoading: boolean | undefined;
  selectedType: any;
  activeTab: string = 'customer'; // Default tab

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  paymentForm!: FormGroup;
  selectedSale: any;
  showIncomeList: any;
  incomeList: any;
  onAccountTypeChange(arg0: any) {
    throw new Error('Method not implemented.');
  }

  uniqueVendors: string[] = [];
  isSidebarOpen: boolean = false;
  salesOrders: any[] = [];
  filteredSalesOrders: any[] = [];
  filteredExpenseOrders: any[] = [];
  filteredAccountingData: any[] = [];
  currentFilters: any = {
    customer: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  };
  totalPendingAP: number = 0;
  totalPendingBills: number = 0;
  dueThisWeek: number = 0;
  dueThisWeekBills: number = 0;
  overdueAmount: number = 0;
  overdueBills: number = 0;
  paidThisMonth: number = 0;
  paidBillsThisMonth: number = 0;
  totalPendingInvoices: number = 0;
  dueThisWeekInvoices: number = 0;
  paidInvoicesThisMonth: number = 0;
  paidThisMonthAR: number = 0;
  overdueAR: number = 0;
  overdueAP: number = 0;
  overdueInvoices: number = 0;
  dueThisWeekAR: number = 0;
  totalPendingAR: number = 0;

  // Current filters for Accounts Receivable
  arFilters: any = {
    customer: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  };

  apFilters: any = {
    vendor: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  };

  accounts: any[] = [];
  expenses: any[] = [];
  accountForm!: FormGroup;
  expenseForm!: FormGroup;
  salesOrderForm!: FormGroup;
  editSalesOrderForm!: FormGroup;
  editingSalesOrderId: string | null = null;
  companies: any[] = [];
  newAccount: any = {};
  newSales: any = {};
  newExpense: any = {};
  companyDetails: any;
  selectedSaleOrder: any;
  selectedExpense: any;
  dueDate: Date = new Date();
  uniqueCustomers: string[] = [];
  availableServices: any[] = [];
  servicesTouched: boolean = false;
  selectedServices: string[] = [];
  availableVendors: any[] = [];
  selectedFiles: any = {};
  fileError: string | null = null; // Add this property to handle file errors

  salesOrdersPerPage = 10;
  currentSalesOrdersPage = 1;

  get paginatedSalesOrders() {
    const start = (this.currentSalesOrdersPage - 1) * this.salesOrdersPerPage;
    // Exclude 'Paid' records from main list
    const unpaidSales = this.salesOrders.filter(
      (order) => order.status2 !== 'Paid'
    );
    return unpaidSales.slice(start, start + this.salesOrdersPerPage);
  }

  get totalSalesOrdersPages() {
    // Always show at least 1 page if there is any data, otherwise 1
    const unpaidSales = this.salesOrders.filter(
      (order) => order.status2 !== 'Paid'
    );
    return Math.max(1, Math.ceil(unpaidSales.length / this.salesOrdersPerPage));
  }

  changeSalesOrdersPage(page: number) {
    if (page >= 1 && page <= this.totalSalesOrdersPages) {
      this.currentSalesOrdersPage = page;
    }
  }


  // Account Types Pagination
  accountsPerPage = 10;
  currentAccountsPage = 1;
  get paginatedAccounts() {
    const start = (this.currentAccountsPage - 1) * this.accountsPerPage;
    return this.accounts.slice(start, start + this.accountsPerPage);
  }
  get totalAccountsPages() {
    return Math.ceil(this.accounts.length / this.accountsPerPage);
  }
  changeAccountsPage(page: number) {
    if (page >= 1 && page <= this.totalAccountsPages) {
      this.currentAccountsPage = page;
    }
  }

  // Expenses Pagination
  expensesPerPage = 10;
  currentExpensesPage = 1;
  get paginatedExpenses() {
    const start = (this.currentExpensesPage - 1) * this.expensesPerPage;
    // Exclude 'Paid' records from main list
    const unpaidExpenses = this.expenses.filter(
      (expense) => expense.status1 !== 'Paid'
    );
    return unpaidExpenses.slice(start, start + this.expensesPerPage);
  }
  get totalExpensesPages() {
    // Always show at least 1 page if there is any data, otherwise 1
    const unpaidExpenses = this.expenses.filter(
      (expense) => expense.status1 !== 'Paid'
    );
    return Math.max(1, Math.ceil(unpaidExpenses.length / this.expensesPerPage));
  }
  changeExpensesPage(page: number) {
    if (page >= 1 && page <= this.totalExpensesPages) {
      this.currentExpensesPage = page;
    }
  }

  // Accounts Payable Pagination
  payablePerPage = 10;
  currentPayablePage = 1;
  get paginatedPayableExpenses() {
    const start = (this.currentPayablePage - 1) * this.payablePerPage;
    return this.filteredExpenseOrders.slice(start, start + this.payablePerPage);
  }
  get totalPayablePages() {
    return Math.ceil(this.filteredExpenseOrders.length / this.payablePerPage);
  }
  changePayablePage(page: number) {
    if (page >= 1 && page <= this.totalPayablePages) {
      this.currentPayablePage = page;
    }
  }

  // Accounts Receivable Pagination
  receivablePerPage = 10;
  currentReceivablePage = 1;
  get paginatedReceivableSales() {
    const start = (this.currentReceivablePage - 1) * this.receivablePerPage;
    return this.filteredSalesOrders.slice(
      start,
      start + this.receivablePerPage
    );
  }
  get totalReceivablePages() {
    return Math.ceil(this.filteredSalesOrders.length / this.receivablePerPage);
  }
  changeReceivablePage(page: number) {
    if (page >= 1 && page <= this.totalReceivablePages) {
      this.currentReceivablePage = page;
    }
  }

  // Add these properties for pagination and data arrays
  accountsPageSize: number = 10;
  salesOrdersPageSize: number = 10;
  expensesPageSize: number = 10;
  payablePageSize: number = 10;
  receivablePageSize: number = 10;
  constructor(
    private fb: FormBuilder,
    private accountingService: ServiceAuthService,
    private toastr: ToastrService,
    private http: HttpClient,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private sharedUtilityService: SharedUtilityService
  ) { }

  ngOnInit(): void {
    // Restore last active tab from localStorage
    const savedTab = localStorage.getItem('accountPermitsActiveTab');
    if (savedTab) {
      this.activeTab = savedTab;
      setTimeout(() => {
        this.activateTab(this.activeTab);
      }, 0);
    }
    this.loadData();
    this.loadExpenseData();
    this.loadAccountPermitData();
    this.initializeForms();
    this.fetchCompanyDetails();
    this.setupOffcanvasClose();
    this.fetchServiceData();
    this.initializePaymentForm();
    this.fetchvendors();
    this.ensureAtLeastTwoCategories(); // Ensure at least 2 categories on init

    // Debug logs to verify filtering
    setTimeout(() => {
      console.log(
        'paginatedSalesOrders (should NOT include Paid):',
        this.paginatedSalesOrders
      );
      console.log(
        'paginatedExpenses (should NOT include Paid):',
        this.paginatedExpenses
      );
      console.log(
        'filteredSalesOrders (AR, can include Paid):',
        this.filteredSalesOrders
      );
      console.log(
        'filteredExpenseOrders (AP, can include Paid):',
        this.filteredExpenseOrders
      );
    }, 2000);

    // Ensure at least 2 rows in the expenseTypeControls FormArray
    const arr = this.expenseForm.get('categories') as FormArray;
    while (arr.length < 1) {
      arr.push(this.createExpenseRow());
    }

    this.setupDueDateAutoCalculation();
    this.setupEditFormDueDateAutoCalculation();

    // --- Add this block for auto-calculating due date in edit sales order form ---
    this.editSalesOrderForm = this.fb.group({
      customerName: ['', Validators.required],
      customerRef: ['', Validators.required],
      mailingAddress: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      terms: ['', Validators.required],
      duedate: ['', Validators.required],
      notes: [''],
      categories: this.fb.array([]), // <-- Add this line for categories FormArray
      // Add more fields as needed
    });

    this.editSalesOrderForm.get('invoiceDate')?.valueChanges.subscribe(() => {
      this.updateEditFormDueDate();
    });
    this.editSalesOrderForm.get('terms')?.valueChanges.subscribe(() => {
      this.updateEditFormDueDate();
    });
    // --- End block ---

    // --- Add this block for auto-calculating due date in add expense form ---
    this.expenseForm.get('billDate')?.valueChanges.subscribe(() => {
      this.updateExpenseDueDate();
    });
    this.expenseForm.get('terms')?.valueChanges.subscribe(() => {
      this.updateExpenseDueDate();
    });
    // --- End block ---

    // --- Add this block for auto-calculating due date in edit expense form ---
    this.editExpenseForm.get('billDate')?.valueChanges.subscribe(() => {
      this.updateEditExpenseDueDate();
    });
    this.editExpenseForm.get('terms')?.valueChanges.subscribe(() => {
      this.updateEditExpenseDueDate();
    });
    // --- End block ---
  }

  initializePaymentForm(): void {
    this.paymentForm = this.fb.group({
      paymentId: ['', Validators.required],
      paymentType: ['', Validators.required],
      refrenceId: ['', Validators.required],
      paymentDate: ['', Validators.required],
      paidAmount: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      account: ['', Validators.required],
      bank: [''],
      transectionNotes: ['', Validators.required],
    });
  }

  isOverdue(duedate: any, status: string): boolean {
    const due = new Date(duedate);
    const today = new Date();
    return due < today && status !== 'Paid';
  }

  isOvershort(totalAmount: number, paidAmount: number): boolean {
    return paidAmount > 0 && paidAmount < totalAmount;
  }

  fetchvendors(): void {
    this.accountingService.getAllVendors().subscribe(
      (response: any) => {
        console.log('Fetched vendors:', response);
        this.availableVendors = response.venders;
      },
      (error) => {
        console.error('Error fetching vendors:', error);
        this.toastr.error('Failed to fetch vendors', 'Error');
      }
    );
  }

  onVendorChange(event: any): void {
    const selectedVendors = this.expenseForm.get('categories') as FormArray;
    const vendorName = event.target.value;

    if (event.target.checked) {
      selectedVendors.push(new FormControl(vendorName));
    } else {
      const index = selectedVendors.controls.findIndex(
        (x: AbstractControl) => x.value === vendorName
      );
      if (index >= 0) {
        selectedVendors.removeAt(index);
      }
    }

    const selectedVendorNames = selectedVendors.value;
    const totalAmount = this.availableVendors
      .filter((vendor) => selectedVendorNames.includes(vendor.vendorName))
      .reduce((sum, vendor) => sum + (vendor.feeAmount || 0), 0);

    this.expenseForm.patchValue({ amount: totalAmount });
  }

  getPaymentStatus(sale: any, statusField: string): string {
    const status = sale?.[statusField] || 'Pending';
    const paidAmount = sale.paidAmount || 0;
    const categoryTotal = this.getSaleCategoryTotal(sale);

    if (this.isOverdue(sale.duedate, status)) {
      return 'Overdue';
    }
    // Show 'Overshort' if paidAmount > 0 but less than category total
    if (paidAmount > 0 && paidAmount < categoryTotal) {
      return 'Overshort';
    }
    // Show 'Paid' only if paidAmount >= category total and status is 'Paid'
    if (paidAmount >= categoryTotal && status === 'Paid') {
      return 'Paid';
    }
    // Ensure 'Pending' is returned if no other conditions are met
    return status === 'Pending' ? 'Pending' : status;
  }

  confirmPayment(): void {
    if (!this.selectedSale || !this.selectedSale.orderId) {
      this.toastr.error('No sale selected for payment.', 'Payment Error');
      return;
    }

    const paymentDetails = {
      paymentId: this.paymentForm.value.paymentId,
      refrenceId: this.paymentForm.value.refrenceId,
      paymentType: this.paymentForm.value.paymentType,
      paymentDate: this.paymentForm.value.paymentDate,
      paidAmount: this.paymentForm.value.paidAmount,
      paymentMethod: this.paymentForm.value.paymentMethod,
      account: this.paymentForm.value.account,
      bank: this.paymentForm.value.bank,
      transectionNotes: this.paymentForm.value.transectionNotes,
      status2: 'Paid',
    };

    // Debug: log the orderId being sent
    console.log(
      'Updating sales order with orderId:',
      this.selectedSale.orderId
    );

    this.accountingService
      .updateSalesOrderPermit(this.selectedSale.orderId, paymentDetails)
      .subscribe(
        () => {
          this.toastr.success('Payment recorded successfully!', 'Success');
          this.loadData();
        },
        (error) => {
          this.toastr.error('Failed to record payment.', 'Error');
        }
      );
  }

  confirmPaymentExpense(): void {
    if (!this.selectedExpense) {
      this.toastr.error('No expense selected for payment.', 'Payment Error');
      return;
    }

    const paymentDetails = {
      paymentId: this.paymentForm.value.paymentId,
      refrenceId: this.paymentForm.value.refrenceId,
      paymentType: this.paymentForm.value.paymentType,
      paymentDate: this.paymentForm.value.paymentDate,
      paidAmount: this.paymentForm.value.paidAmount,
      paymentMethod: this.paymentForm.value.paymentMethod,
      account: this.paymentForm.value.account,
      transectionNotes: this.paymentForm.value.transectionNotes,
      status1: 'Paid',
    };

    this.accountingService
      .updateExpensePermit(this.selectedExpense.expenseId, paymentDetails)
      .subscribe(
        () => {
          this.toastr.success('Payment recorded successfully!', 'Success');
          this.loadExpenseData();
        },
        (error) => {
          this.toastr.error('Failed to record payment.', 'Error');
        }
      );
  }

  openPaymentModalExpense(expense: any): void {
    this.selectedExpense = expense;
    this.paymentForm.reset({
      paymentId: '',
      refrenceId: '',
      paymentType: '',
      paymentDate: '',
      paidAmount: '',
      method: '',
      details: '',
      account: '',
      transectionNotes: '',
    });
  }

  fetchServiceData(): void {
    this.accountingService.getAllService().subscribe(
      (response: any) => {
        console.log('Fetched services:', response);
        this.availableServices = response.data;
      },
      (error) => {
        console.error('Error fetching services:', error);
        this.toastr.error('Failed to fetch services', 'Error');
      }
    );
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar state:', this.isSidebarOpen);
  }

  loadData() {
    this.accountingService.getSalesOrderPermitFromAPI().subscribe(
      (data) => {
        this.salesOrders = Array.isArray(data) ? data : [];
        this.filteredSalesOrders = [...this.salesOrders];
        this.salesOrderSearchTerm = '';

        // Extract unique customer names
        this.uniqueCustomers = [
          ...new Set(this.salesOrders.map((order) => order.customerName)),
        ];

        console.log('Sales Orders:', this.salesOrders);
        console.log('Unique Customers:', this.uniqueCustomers);

        if (this.salesOrders.length > 0) {
          this.selectedSaleOrder = this.salesOrders[0];
          this.dueDate = new Date(this.selectedSaleOrder.date);
          this.dueDate.setDate(this.dueDate.getDate() + 30);
          this.calculateARSummary();
        }
      },
      (error: any) => {
        console.error('Error fetching sales orders:', error);
      }
    );

    this.loadOtherData();
  }

  filterSalesOrdersByCustomer(event: Event): void {
    const selectedCustomer = (event.target as HTMLSelectElement).value;
    this.currentFilters.customer = selectedCustomer;
  }

  filterSalesOrdersByStatus(event: Event): void {
    const selectedStatus = (event.target as HTMLSelectElement).value;
    this.currentFilters.status = selectedStatus;
    // Apply the filter immediately
    this.filteredSalesOrders = this.salesOrders.filter((order) => {
      const status = this.getPaymentStatus(order, 'status2');
      return !selectedStatus || status === selectedStatus;
    });
    this.calculateARSummary();
  }

  filterSalesOrdersByDateRange(): void {
    const fromDateInput = (
      document.getElementById('arDateFrom') as HTMLInputElement
    ).value;
    const toDateInput = (
      document.getElementById('arDateTo') as HTMLInputElement
    ).value;

    this.currentFilters.dateFrom = fromDateInput;
    this.currentFilters.dateTo = toDateInput;
  }

  applySalesOrderFilters(): void {
    this.filteredSalesOrders = this.salesOrders.filter((order) => {
      // Customer filter
      const matchesCustomer =
        !this.currentFilters.customer ||
        order.customerName === this.currentFilters.customer;

      // Status filter
      let matchesStatus = true;
      if (this.currentFilters.status === 'Paid') {
        matchesStatus = this.getPaymentStatus(order, 'status2') === 'Paid';
      } else if (this.currentFilters.status === 'Overshort') {
        matchesStatus = this.getPaymentStatus(order, 'status2') === 'Overshort';
      } else if (this.currentFilters.status === 'Overdue') {
        matchesStatus = this.getPaymentStatus(order, 'status2') === 'Overdue';
      } else if (this.currentFilters.status === 'Pending') {
        matchesStatus = this.getPaymentStatus(order, 'status2') === 'Pending';
      } else if (this.currentFilters.status) {
        matchesStatus = this.getPaymentStatus(order, 'status2') === this.currentFilters.status;
      }

      // Date range filter (use duedate)
      let matchesDateRange = true;
      if (this.currentFilters.dateFrom || this.currentFilters.dateTo) {
        const dueDate = order.duedate ? new Date(order.duedate) : null;
        const fromDate = this.currentFilters.dateFrom ? new Date(this.currentFilters.dateFrom) : null;
        const toDate = this.currentFilters.dateTo ? new Date(this.currentFilters.dateTo) : null;
        matchesDateRange = true;
        if (fromDate && dueDate) {
          matchesDateRange = matchesDateRange && dueDate >= fromDate;
        }
        if (toDate && dueDate) {
          matchesDateRange = matchesDateRange && dueDate <= toDate;
        }
      }

      return matchesCustomer && matchesStatus && matchesDateRange;
    });
    this.calculateARSummary();
  }

  resetSalesOrderFilters(): void {
    this.currentFilters = {
      customer: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };

    // Reset the form inputs
    (document.getElementById('arCustomerFilter') as HTMLSelectElement).value =
      '';
    (document.getElementById('arStatusFilter') as HTMLSelectElement).value = '';
    (document.getElementById('arDateFrom') as HTMLInputElement).value = '';
    (document.getElementById('arDateTo') as HTMLInputElement).value = '';

    // Reset the filtered data
    this.filteredSalesOrders = [...this.salesOrders];
    this.calculateARSummary();
  }

  loadExpenseData() {
    this.accountingService.getExpensePermitFromAPI().subscribe((data: any) => {
      this.expenses = Array.isArray(data) ? data : [];
      this.filteredExpenseOrders = [...this.expenses];
      this.expenseSearchTerm = '';

      this.uniqueVendors = [
        ...new Set(this.expenses.map((expense) => expense.vendorName)),
      ];

      // Call calculateAPSummary to update the summary values
      this.calculateAPSummary();
      this.cdr.detectChanges();
    });
  }

  applyFilters(): void {
    const fromDateInput = (
      document.getElementById('apDateFrom') as HTMLInputElement
    ).value;
    const toDateInput = (
      document.getElementById('apDateTo') as HTMLInputElement
    ).value;
    const statusInput = (
      document.getElementById('apStatusFilter') as HTMLSelectElement
    ).value; // Fetch the latest status value
    const vendorInput = (
      document.getElementById('apVendorFilter') as HTMLSelectElement
    ).value;

    const fromDate = fromDateInput ? new Date(fromDateInput) : null;
    const toDate = toDateInput ? new Date(toDateInput) : null;

    this.filteredExpenseOrders = this.expenses.filter((expense) => {
      // Use billDate if available, else fallback to date
      const billDate = expense.billDate ? new Date(expense.billDate) : (expense.date ? new Date(expense.date) : null);
      const isWithinDateRange =
        (!fromDate || (billDate && billDate >= fromDate)) && (!toDate || (billDate && billDate <= toDate));
      const matchesVendor = !vendorInput || expense.vendorName === vendorInput;

      let matchesStatus = true;
      if (statusInput === 'Pending') {
        matchesStatus =
          expense.status1 === 'Pending' &&
          !this.isOverdue(expense.duedate, expense.status1);
      } else if (statusInput === 'Paid') {
        // Show only fully paid entries (not overshort)
        matchesStatus =
          expense.status1 === 'Paid' &&
          !this.isOvershort(this.getExpenseCategoryTotal(expense), expense.paidAmount);
      } else if (statusInput === 'Overshort') {
        // Show only overshort entries (partially paid)
        matchesStatus =
          expense.status1 === 'Paid' &&
          this.isOvershort(this.getExpenseCategoryTotal(expense), expense.paidAmount);
      } else if (statusInput === 'Overdue') {
        matchesStatus = this.isOverdue(expense.duedate, expense.status1);
      } else if (statusInput) {
        matchesStatus = expense.status1 === statusInput;
      }

      return isWithinDateRange && matchesVendor && matchesStatus;
    });

    // Call calculateAPSummary to update the summary values
    this.calculateAPSummary();
    this.cdr.detectChanges();
  }

  // filterExpensesByDateRange(): void {
  //   const fromDateInput = (document.getElementById('apDateFrom') as HTMLInputElement).value;
  //   const toDateInput = (document.getElementById('apDateTo') as HTMLInputElement).value;

  //   (document.getElementById('apDateFrom') as HTMLInputElement).dataset['selectedDate'] = fromDateInput;
  //   (document.getElementById('apDateTo') as HTMLInputElement).dataset['selectedDate'] = toDateInput;
  // }
  filterExpensesByDateRange(): void {
    const { dateFrom, dateTo } = this.apFilters;
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate: Date | null = dateTo ? new Date(dateTo) : null;

    this.filteredExpenseOrders = this.expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        (!fromDate || expenseDate >= fromDate) &&
        (!toDate || expenseDate <= toDate)
      );
    });

    // Trigger change detection to ensure the UI updates
    this.cdr.detectChanges();
  }

  filterExpensesByStatus(event: Event): void {
    const selectedStatus = (event.target as HTMLSelectElement).value;
    this.apFilters.status = selectedStatus; // Update the status in the filters object
  }

  resetFilters(): void {
    (document.getElementById('apDateFrom') as HTMLInputElement).value = '';
    (document.getElementById('apDateTo') as HTMLInputElement).value = '';
    (document.getElementById('apStatusFilter') as HTMLSelectElement).value = '';
    (document.getElementById('apVendorFilter') as HTMLSelectElement).value = '';
    this.filteredExpenseOrders = [...this.expenses];
    this.cdr.detectChanges();
  }

  loadOtherData() {
    this.accountingService.getAccountPermitFromAPI().subscribe((data) => {
      this.accounts = Array.isArray(data) ? data : [];

      // Filter out accounts with type 'Expense'
      this.filteredAccountingData = this.accounts.filter(
        (account) => account.type === 'Expense'
      );
      this.accountSearchTerm = '';
      this.accounts = [...this.filteredAccountingData];

      // Extract bank-type account options (bankName - bankAccountNumber)
      this.bankOptions = this.accounts
        .filter((account) => account.type?.toLowerCase() === 'bank')
        .map(
          (account) =>
            `${account.bankName || 'Unknown Bank'} - ${account.bankAccountNumber || 'No Account Number'
            }`
        );
    });
  }


  onTypeChange() {
    this.selectedType = this.accountForm.get('type')?.value;

    // Reset fields when type changes
    this.accountForm.patchValue({
      bankAccountNumber: '',
      bankName: '',
      bankType: '',
      cardNumber: '',
      providerName: ''
    });
  }

  initializeForms() {
    this.accountForm = this.fb.group({
      type: ['', Validators.required],
      accountId: ['', Validators.required],
      accountName: ['', Validators.required],
      bankAccountNumber: [''],
      bankName: [''],
      bankType: [''],
      cardNumber: [''],
      providerName: [''],
      description: ['', Validators.required],
      createdBy: [''],
      adminId: [''],
      superadminId: [''],
      updatedBy: [''],
      companyId: [''],
    });

    this.expenseForm = this.fb.group({
      expenseId: [''],
      vendorName: ['', Validators.required],
      vendorRefrence: ['', Validators.required],
      billNumber: ['', Validators.required],
      mailingAddress: ['', Validators.required],
      terms: ['', Validators.required],
      billDate: ['', Validators.required],
      duedate: ['', Validators.required],
      paymentMethodByField: ['', Validators.required],
      notes: ['', Validators.required],
      expenseUploadDocument: ['N/A'],
      categories: this.fb.array([this.createExpenseRow()], Validators.required), // Only 1 default row
      paymentId: [''],
      paymentType: [''],
      refrenceId: [''],
      paymentDate: [''],
      paidAmount: [''],
      paymentMethod: [''],
      account: [''],
      transectionNotes: [''],
      status: ['Not Generated', Validators.required], // Set default value
      status1: ['Pending', Validators.required], // Set default value
      createdBy: [''],
      adminId: [''],
      superadminId: [''],
      updatedBy: [''],
      companyId: [''],
    });

    this.salesOrderForm = this.fb.group({
      orderId: [''],
      customerName: ['', Validators.required],
      companyId: ['DefaultCompanyId', Validators.required], // Default value here
      status2: ['Pending', Validators.required],
      status: ['Not Generated', Validators.required],
      paymentId: [''],
      refrenceId: [''],
      paymentDate: [''],
      paymentType: [''],
      paidAmount: [''],
      paymentMethod: [''],
      account: [''],
      transectionNotes: [''],
      createdBy: [''],
      adminId: [''],
      superadminId: [''],
      updatedBy: [''],
      categories: this.fb.array([this.createCategoryGroup()]), // Only 1 default row
      mailingAddress: ['', Validators.required], // Ensure mailingAddress is required
      terms: ['', Validators.required], // Ensure terms is required
      duedate: ['', Validators.required],
      customerRef: ['', Validators.required], // Ensure customerRef is required
      invoiceDate: ['', Validators.required],
      notes: [''],
      salesuploadDocument: ['N/A'], // Set default to 'N/A' to satisfy backend required field
    });

    this.editExpenseForm = this.fb.group({
      expenseId: [''],
      vendorName: ['', Validators.required],
      vendorRefrence: ['', Validators.required],
      billNumber: ['', Validators.required],
      mailingAddress: ['', Validators.required],
      terms: ['', Validators.required],
      billDate: ['', Validators.required],
      duedate: ['', Validators.required],
      paymentMethodByField: ['', Validators.required],
      notes: ['', Validators.required],
      expenseUploadDocument: ['N/A'],
      categories: this.fb.array([], Validators.required), // Important
      paymentId: [''],
      paymentType: [''],
      refrenceId: [''],
      paymentDate: [''],
      paidAmount: [''],
      paymentMethod: [''],
      account: [''],
      transectionNotes: [''],
      status: ['Not Generated', Validators.required],
      status1: ['Pending', Validators.required],
      createdBy: [''],
      adminId: [''],
      superadminId: [''],
      updatedBy: [''],
      companyId: [''],
    });

    this.editSalesOrderForm = this.fb.group({
      customerName: ['', Validators.required],
      customerRef: ['', Validators.required],
      mailingAddress: ['', Validators.required],
      invoiceDate: ['', Validators.required],
      terms: ['', Validators.required],
      duedate: ['', Validators.required],
      notes: [''],
      categories: this.fb.array([]), // <-- Add this line for categories FormArray
      // Add more fields as needed
    });
  }

  get categoryControls(): FormArray {
    return this.salesOrderForm.get('categories') as FormArray;
  }

  get expenseTypeControls(): FormArray {
    return this.expenseForm.get('categories') as FormArray;
  }

  onCategoryServiceChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedService = selectElement.value;
    this.categoryControls.at(index).get('category')?.setValue(selectedService);

    // Find the selected service's fixed price
    const service = this.availableServices.find(
      (s) => s.serviceName === selectedService
    );
    const fixedPrice = service?.price || 0;

    // Set the amount as the fixed price (not multiplied by quantity)
    this.categoryControls.at(index).get('amount')?.setValue(fixedPrice);

    // Optionally, update total amount column if needed
  }
  removeCategory(index: number): void {
    const categories = this.salesOrderForm.get('categories') as FormArray | null;
    if (categories && categories.length > 1) {
      categories.removeAt(index);
      // Optionally, call ensureAtLeastTwoCategories() if you want to always keep at least 1 row
      this.ensureAtLeastTwoCategories();
    }
  }

  clearCategories(): void {
    const categories = this.salesOrderForm.get(
      'categories'
    ) as FormArray | null;
    if (categories) {
      while (categories.length > 0) {
        categories.removeAt(0);
      }
      this.ensureAtLeastTwoCategories();
    }
  }

  // Call this after form initialization, after removeCategory, and after clearCategories
  ensureAtLeastTwoCategories() {
    const categories = this.salesOrderForm.get('categories') as FormArray | null;
    if (categories) {
      while (categories.length < 1) {
        categories.push(this.createCategoryGroup());
      }
    }
  }

  createCategoryGroup(): FormGroup {
    return this.fb.group({
      category: [[]], // initialize as empty array, because multiple services select honge
      description: [''],
      quantity: [1],
      amount: [0],
    });
  }

  createExpenseRow(): FormGroup {
    // Always set quantity: 1 and amount: 0 as default
    return this.fb.group({
      category: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [0, Validators.required],
    });
  }

  loadAccountPermitData() {
    this.accountingService.getAllCompanies().subscribe(
      (data: any) => {
        this.companies = data.map((company: any) => ({
          companyId: company.companyId,
          createdBy: company.createdBy,
          adminId: company.adminId,
          superadminId: company.superadminId,
          updatedBy: company.updatedBy,
          ...company,
        }));
      },
      (error) => {
        console.error('Error loading companies:', error);
      }
    );
  }
  fetchCompanyDetails(): void {
    this.accountingService.getAllCompanies().subscribe({
      next: (data: any) => {
        if (Array.isArray(data) && data.length > 0) {
          this.companyDetails = data[0];
          this.patchFormsWithCompanyData(); // Now safe to patch
        }
      },
      error: (error) => {
        this.toastr.error('Failed to fetch company details.', 'Error');
      },
    });
  }

  private patchFormsWithCompanyData() {
    if (!this.companyDetails) return;

    this.salesOrderForm.patchValue({
      companyId: this.companyDetails.companyId || 'DefaultCompanyId',
      createdBy: this.companyDetails.createdBy || 'DefaultAdminId',
      adminId: this.companyDetails.adminId || 'DefaultAdminId',
      superadminId: this.companyDetails.superadminId || 'DefaultSuperAdminId',
      updatedBy: this.companyDetails.updatedBy || 'DefaultAdminId',
    });
  }
  submitExpenseForm() {
    this.expenseForm.markAllAsTouched();
    this.expenseForm.updateValueAndValidity();

    const formData = new FormData();
    const formValues = this.expenseForm.value;

    // --- Generate unique expenseId using timestamp to avoid duplicate key error ---
    const uniqueExpenseId = `EXP${Date.now()}`;
    formData.set('expenseId', uniqueExpenseId);

    // Append categories as array of objects, not as a JSON string
    const categories = this.expenseForm.get('categories')?.value;
    if (Array.isArray(categories)) {
      categories.forEach((cat, idx) => {
        Object.keys(cat).forEach((key) => {
          formData.append(`categories[${idx}][${key}]`, cat[key]);
        });
      });
    }

    // Append other fields except type, categories, and expenseUploadDocument
    Object.keys(formValues).forEach((key) => {
      if (
        key !== 'type' &&
        key !== 'categories' &&
        key !== 'expenseUploadDocument'
      ) {
        formData.append(key, formValues[key]);
      }
    });

    // Handle expenseId and companyId
    formData.set('expenseId', `EXP${this.expenses.length + 1}`);
    formData.set('companyId', formValues.companyId || 'DefaultCompanyId');

    // Always append expenseUploadDocument, even if empty
    const file = this.newExpense['expenseUploadDocument'];
    if (file) {
      formData.append('expenseUploadDocument', file, file.name);
    } else {
      // Append a dummy value if not present to satisfy backend required field
      formData.append('expenseUploadDocument', 'N/A');
    }

    this.accountingService.createExpensePermit(formData).subscribe(
      (response: any) => {
        this.toastr.success('Expense permit created successfully!', 'Success');
        this.expenseForm.reset({
          expenseId: '',
          vendorName: '',
          vendorRefrence: '',
          billNumber: '',
          mailingAddress: '',
          terms: '',
          billDate: '',
          duedate: '',
          paymentMethodByField: '',
          notes: '',
          expenseUploadDocument: 'N/A',
          categories: this.fb.array([]),
          paymentId: '',
          paymentType: '',
          refrenceId: '',
          paymentDate: '',
          paidAmount: '',
          paymentMethod: '',
          account: '',
          transectionNotes: '',
          status: 'Not Generated',
          status1: 'Pending',
          createdBy: '',
          adminId: '',
          superadminId: '',
          updatedBy: '',
          companyId: formValues.companyId || 'DefaultCompanyId',
        });
        this.expenseForm.setControl('categories', this.fb.array([]));
        window.location.reload();
      },
      (error) => {
        this.toastr.error('Failed to create expense .', 'Error');
      }
    );
  }

  submitAccountForm() {
    this.accountForm.markAllAsTouched();
    this.accountForm.updateValueAndValidity();

    const accountId = `AID${this.accounts.length + 1}`;
    const accountData = {
      ...this.accountForm.value,
      accountId,
      companyId: this.accountForm.value.companyId || 'DefaultCompanyId',
      adminId: this.accountForm.value.adminId || 'DefaultAdminId',
    };

    this.accountingService.createAccountPermit(accountData).subscribe(
      (response: any) => {
        this.toastr.success('Account  created successfully!', 'Success');
        this.accountForm.reset();
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Delay for toast visibility
      },
      (error) => {
        this.toastr.error('Failed to create account .', 'Error');
      }
    );
  }

  submitSalesOrderForm() {
    this.salesOrderForm.markAllAsTouched();
    this.salesOrderForm.updateValueAndValidity();

    if (this.salesOrderForm.invalid) {
      this.toastr.error(
        'Please fill all required fields.',
        'Form Submission Error'
      );
      return;
    }

    const formData = new FormData();
    const formValues = this.salesOrderForm.value;

    // Append categories
    const categories = this.salesOrderForm.get('categories')?.value;
    if (Array.isArray(categories)) {
      categories.forEach((cat, idx) => {
        Object.keys(cat).forEach((key) => {
          formData.append(`categories[${idx}][${key}]`, cat[key]);
        });
      });
    }

    // Append other fields
    Object.keys(formValues).forEach((key) => {
      if (key !== 'categories' && key !== 'salesuploadDocument') {
        formData.append(key, formValues[key]);
      }
    });

    // Append file
    const file = this.newSales['salesuploadDocument'];
    if (file) {
      formData.append('salesuploadDocument', file);
    } else {
      formData.append('salesuploadDocument', 'N/A');
    }

    // Generate IDs
    formData.set('orderId', `ORD${this.salesOrders.length + 1}`);
    formData.set('companyId', formValues.companyId || 'DefaultCompanyId');

    this.accountingService.createSalesOrderPermit(formData).subscribe(
      (response: any) => {
        // ✅ Toastr success
        this.toastr.success('Sales Order  created successfully!', 'Success');

        // Reset form
        this.salesOrderForm.reset({
          orderId: '',
          customerName: '',
          invoiceDate: '',
          mailingAddress: '',
          terms: '',
          customerRef: '',
          categories: this.fb.array([]),
          duedate: '',
          notes: '',
          salesuploadDocument: 'N/A',
          amount: '',
          status2: 'Pending',
          status: 'Not Generated',
          paymentId: '',
          refrenceId: '',
          paymentDate: '',
          paymentType: '',
          paidAmount: '',
          paymentMethod: '',
          account: '',
          transectionNotes: '',
          createdBy: '',
          adminId: '',
          superadminId: '',
          updatedBy: '',
          companyId: formValues.companyId || 'DefaultCompanyId',
        });

        // ✅ Delay reload to allow toast to appear
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Adjust delay as needed
      },
      (error) => {
        this.toastr.error('Failed to create Sales Order .', 'Error');
      }
    );
  }

  getInvalidFields(formGroup: FormGroup, parentKey: string = ''): string[] {
    const invalidFields: string[] = [];

    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      const controlKey = parentKey ? `${parentKey}.${key}` : key;

      if (control instanceof FormGroup) {
        invalidFields.push(...this.getInvalidFields(control, controlKey));
      } else if (control && control.invalid) {
        invalidFields.push(key);
      }
    });

    return invalidFields;
  }

  onCompanyChange(event: Event): void {
    const selectedCompanyId = (event.target as HTMLSelectElement).value;
    const selectedCompany = this.companies.find(
      (company) => company.companyId === selectedCompanyId
    );

    if (selectedCompany) {
      this.salesOrderForm.patchValue({
        companyId: selectedCompany.companyId,
        customerName: selectedCompany.companyName,
        createdBy: selectedCompany.createdBy,
        updatedBy: selectedCompany.updatedBy,
      });
    }
  }
  onServiceChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const serviceName = checkbox.value;
    const currentTypes: string[] = this.salesOrderForm.get('type')?.value || [];

    if (checkbox.checked) {
      if (!currentTypes.includes(serviceName)) {
        currentTypes.push(serviceName);
      }
    } else {
      const index = currentTypes.indexOf(serviceName);
      if (index > -1) {
        currentTypes.splice(index, 1);
      }
    }

    this.salesOrderForm.get('type')?.setValue(currentTypes);
    this.calculateTotalPrice();
  }

  calculateTotalPrice(): void {
    const selectedServices = this.salesOrderForm.get('type')?.value || [];
    const totalPrice = selectedServices.reduce(
      (total: number, serviceName: string) => {
        const service = this.availableServices.find(
          (s) => s.serviceName === serviceName
        );
        return total + (service?.price || 0);
      },
      0
    );

    this.salesOrderForm.patchValue(
      { amount: totalPrice },
      { emitEvent: false }
    );
  }

  onClose(): void {
    console.log('Offcanvas closed');
  }

  setupOffcanvasClose() {
    this.sharedUtilityService.setupOffcanvasClose(this.renderer);
  }

  getGeneratedSalesOrders(): any[] {
    return this.salesOrders.filter((order) => order.status === 'Generated');
  }

  generatePDF(sale?: any) {
    this.selectedSaleOrder = sale || this.selectedSaleOrder;

    if (!this.selectedSaleOrder) {
      this.toastr.warning('No sales order selected', 'Warning');
      return;
    }

    if (!this.dueDate && this.selectedSaleOrder.date) {
      this.dueDate = new Date(this.selectedSaleOrder.date);
      this.dueDate.setDate(this.dueDate.getDate() + 30);
    }

    // Let Angular render the DOM before capturing
    setTimeout(() => {
      const originalElement = document.getElementById('invoice-container');
      if (!originalElement) {
        console.error('Invoice container not found');
        return;
      }

      const clone = originalElement.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.left = '-9999px';
      clone.style.display = 'block';
      document.body.appendChild(clone);

      html2canvas(clone, {
        scale: 2,
        useCORS: true,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const imgWidth = pageWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
          pdf.save('invoice.pdf');

          this.selectedSaleOrder.status = 'Generated';

          this.accountingService
            .updateSalesOrderPermit(this.selectedSaleOrder._id, {
              status: 'Generated',
            })
            .subscribe(
              () => {
                this.toastr.success(
                  'Invoice status updated to Generated',
                  'Success'
                );
                this.loadData();
              },
              (error) => {
                this.toastr.error('Failed to update invoice status.', 'Error');
              }
            );

          document.body.removeChild(clone);
        })
        .catch((error) => {
          this.toastr.error('Failed to generate PDF', 'Error');
          document.body.removeChild(clone);
        });
    }, 50); // delay lets Angular render DOM
  }

  getGeneratedExpenseOrders() {
    return this.expenses;
  }

  markAsPaid(expense: any): void {
    expense.status1 = 'Paid';

    this.accountingService
      .updateExpensePermit(expense._id, { status1: 'Paid' })
      .subscribe({
        next: (updatedExpense) => {
          this.toastr.success('Expense status updated to Paid', 'Success');
          this.loadExpenseData();
        },
        error: (err) => {
          this.toastr.error('Failed to update expense status', 'Error');
        },
      });
  }

  generateExpensePDF(expense?: any): void {
    this.selectedExpense = expense || this.selectedExpense;

    // Ensure vendors are fetched before proceeding
    this.fetchvendors();

    // Wait for vendors to be fetched
    setTimeout(() => {
      if (!this.availableVendors || this.availableVendors.length === 0) {
        return;
      }

      // Fetch vendor details from the availableVendors array
      const vendorName = this.selectedExpense.vendorName;
      const vendor = this.availableVendors.find(
        (v) => v.vendorName === vendorName
      );

      if (vendor) {
        this.selectedExpense.streetAddress = vendor.streetAddress || 'N/A';
        this.selectedExpense.primaryContactPhone =
          vendor.primaryContactPhone || 'N/A';
        this.selectedExpense.primaryContactEmail =
          vendor.primaryContactEmail || 'N/A';
      }

      if (!this.dueDate && this.selectedExpense.date) {
        this.dueDate = new Date(this.selectedExpense.date);
        this.dueDate.setDate(this.dueDate.getDate() + 30);
      }

      // Debug logs to verify service prices and subtotal

      setTimeout(() => {
        const originalElement = document.getElementById('bill-container');
        if (!originalElement) {
          console.error('Bill container not found');
          return;
        }

        const clone = originalElement.cloneNode(true) as HTMLElement;
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.display = 'block';
        document.body.appendChild(clone);

        html2canvas(clone, {
          scale: 2,
          useCORS: true,
        })
          .then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save('bill.pdf');

            this.selectedExpense.status = 'Generated';

            this.accountingService
              .updateExpensePermit(this.selectedExpense._id, {
                status: 'Generated',
              })
              .subscribe(
                () => {
                  this.toastr.success(
                    'Bill status updated to Generated',
                    'Success'
                  );
                  this.loadExpenseData();
                },
                (error) => {
                  this.toastr.error('Failed to update bill status.', 'Error');
                }
              );

            document.body.removeChild(clone);
          })
          .catch((error) => {
            this.toastr.error('Failed to generate PDF', 'Error');
            document.body.removeChild(clone);
          });
      }, 50);
    }, 500); // Delay to ensure fetchvendors completes
  }

  filterExpenseOrders(): any[] {
    const searchTerm = '';
    return this.expenses.filter((order) =>
      order.vendorName.toLowerCase().includes(searchTerm)
    );
  }

  filterSalesOrders(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    this.filteredSalesOrders = this.salesOrders.filter((order) => {
      return order.status1 === 'Pending';
    });
  }

  markAsPaidSales(sales: any): void {
    sales.status2 = 'Paid';

    this.accountingService
      .updateSalesOrderPermit(sales._id, { status2: 'Paid' })
      .subscribe({
        next: (updatedSalesOrder) => {
          this.toastr.success('Sales status updated to Paid', 'Success');
          this.loadData();
        },
        error: (err) => {
          this.toastr.error('Failed to update sales status.', 'Error');
        },
      });
  }

  openPaymentModal(sale: any): void {
    if (!sale || !sale._id) {
      console.error('Invalid sale object:', sale);
      this.toastr.error('Invalid sale selected.', 'Error');
      return;
    }

    this.selectedSale = sale;
    this.paymentForm.reset({
      paymentId: '',
      paymentType: '',
      refrenceId: '',
      paymentDate: '',
      paidAmount: '',
      method: '',
      details: '',
      account: '',
      transectionNotes: '',
    });
  }

  onTabChange(tabId: string): void {
    this.activeTab = tabId;
    localStorage.setItem('accountPermitsActiveTab', tabId);
    this.activateTab(tabId);
  }

  activateTab(tabId: string): void {
    // Bootstrap tab activation (if needed)
    const tabTrigger = document.querySelector(`[data-bs-target="#${tabId}"]`);
    if (tabTrigger) {
      (tabTrigger as HTMLElement).click();
    }
  }

  calculateARSummary(): void {
    this.totalPendingAR = 0;
    this.totalPendingInvoices = 0;
    this.dueThisWeekAR = 0;
    this.dueThisWeekInvoices = 0;
    this.overdueAR = 0;
    this.overdueInvoices = 0;
    this.paidThisMonthAR = 0;
    this.paidInvoicesThisMonth = 0;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    this.filteredSalesOrders.forEach((order) => {
      const dueDate = new Date(order.duedate);
      const categoryTotal = this.getSaleCategoryTotal(order);
      const paidDate = order.paymentDate
        ? new Date(order.paymentDate)
        : order.date
          ? new Date(order.date)
          : null;
      const paidAmount = Number(order.paidAmount) || 0;

      if (order.status2 === 'Pending') {
        this.totalPendingAR += categoryTotal;
        this.totalPendingInvoices++;
      }

      if (
        dueDate >= today &&
        dueDate <= endOfWeek &&
        order.status2 === 'Pending'
      ) {
        this.dueThisWeekAR += categoryTotal;
        this.dueThisWeekInvoices++;
      }

      if (dueDate < today && order.status2 !== 'Paid') {
        this.overdueAR += categoryTotal;
        this.overdueInvoices++;
      }

      // Only count as paid if paidAmount > 0 and paidDate is in this month
      if (
        order.status2 === 'Paid' &&
        paidDate &&
        paidDate >= startOfMonth &&
        paidAmount > 0
      ) {
        this.paidThisMonthAR += paidAmount;
        this.paidInvoicesThisMonth++;
      }
    });

    this.cdr.detectChanges();
  }

  getExpenseCategoryTotal(expense: any): number {
    if (!expense || !Array.isArray(expense.categories)) return 0;
    return expense.categories.reduce(
      (sum: number, cat: any) => sum + (cat.amount || 0),
      0
    );
  }

  calculateAPSummary(): void {
    this.totalPendingAP = 0;
    this.totalPendingBills = 0;
    this.dueThisWeekAP = 0;
    this.dueThisWeekBills = 0;
    this.overdueAP = 0;
    this.overdueBills = 0;
    this.paidThisMonthAP = 0;
    this.paidBillsThisMonth = 0;

    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    this.filteredExpenseOrders.forEach((order) => {
      const dueDate = new Date(order.duedate);
      const categoryTotal = this.getExpenseCategoryTotal(order);
      const paidDate = order.paymentDate
        ? new Date(order.paymentDate)
        : order.date
          ? new Date(order.date)
          : null;
      const paidAmount = Number(order.paidAmount) || 0;

      if (
        order.status1 === 'Pending' &&
        !this.isOverdue(order.duedate, order.status1)
      ) {
        this.totalPendingAP += categoryTotal;
        this.totalPendingBills++;
      }

      if (
        dueDate >= today &&
        dueDate <= endOfWeek &&
        order.status1 === 'Pending'
      ) {
        this.dueThisWeekAP += categoryTotal;
        this.dueThisWeekBills++;
      }

      if (dueDate < today && order.status1 !== 'Paid') {
        this.overdueAP += categoryTotal;
        this.overdueBills++;
      }

      // Only count as paid if paidAmount > 0 and paidDate is in this month
      if (
        order.status1 === 'Paid' &&
        paidDate &&
        paidDate >= startOfMonth &&
        paidAmount > 0
      ) {
        this.paidThisMonthAP += paidAmount;
        this.paidBillsThisMonth++;
      }
    });

    this.cdr.detectChanges();
  }

  applyAPFilters() {
    console.log('Applying AP filters:', this.apFilters);
  }

  resetAPFilters() {
    this.apFilters = {
      vendor: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    console.log('AP filters reset');
  }

  applyARFilters() {
    console.log('Applying AR filters:', this.arFilters);
  }

  resetARFilters() {
    this.arFilters = {
      customer: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    console.log('AR filters reset');
  }

  toggleServiceOptions() {
    this.showServiceOptions = !this.showServiceOptions;
  }

  toggleVendorOptions(): void {
    this.showVendorOptions = !this.showVendorOptions; // Toggle the visibility
  }

  onExpenseFileSelected(event: Event, expense: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();

      // Append the file and expense ID with correct field names
      formData.append('uploadDocument', file);
      formData.append('expenseId', expense.expenseId);

      // Debugging: Log the FormData content
      formData.forEach((value, key) => {
        console.log(`${key}:`, value);
      });

      // Call the upload method
      this.uploadExpenseDocument(formData, expense);
    }
  }

  uploadExpenseDocument(formData: FormData, expense: any): void {
    this.accountingService.ExpenseuploadDocument(formData).subscribe(
      (response: any) => {
        if (response && response.message === 'No document uploaded') {
          this.toastr.error(
            'No document uploaded. Please select a file to upload.',
            'Upload Error'
          );
          return;
        }
        this.toastr.success('Document uploaded successfully!', 'Success');

        // Debug: log the full response to see what the backend returns
        console.log('Upload response:', response);

        // Find the expense in your data array and update it
        const index = this.expenses.findIndex(
          (e) => e.expenseId === expense.expenseId
        );
        if (index !== -1) {
          if (!this.expenses[index].uploadDocument) {
            this.expenses[index].uploadDocument = [];
          }
          // Try to get the file URL from different possible properties
          const fileUrl =
            response.documentUrl ||
            response.fileUrl ||
            response.url ||
            response.path ||
            response.filename ||
            null;
          if (fileUrl) {
            this.expenses[index].uploadDocument.push(fileUrl);
          } else {
            // If no URL, push the whole response for debugging
            this.expenses[index].uploadDocument.push(response);
          }
          this.expenses = [...this.expenses]; // Creates new array reference
        }
      },
      (error) => {
        if (error?.error?.message === 'No document uploaded') {
          this.toastr.error(
            'No document uploaded. Please select a file to upload.',
            'Upload Error'
          );
        } else {
          this.toastr.error('Failed to upload document.', 'Error');
        }
      }
    );
  }

  onSalesFileSelected(event: Event, sale: any): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const formData = new FormData();

      // Use the expected field name
      formData.append('uploadDocument', file);
      formData.append('orderId', sale.orderId);

      this.uploadSalesDocument(formData);
    }
  }

  uploadSalesDocument(formData: FormData): void {
    this.accountingService.SalesuploadDocument(formData).subscribe(
      (response: any) => {
        if (response && response.message === 'No document uploaded') {
          this.toastr.error(
            'No document uploaded. Please select a file to upload.',
            'Upload Error'
          );
          return;
        }
        this.toastr.success('Document uploaded successfully!', 'Success');
      },
      (error) => {
        if (error?.error?.message === 'No document uploaded') {
          this.toastr.error(
            'No document uploaded. Please select a file to upload.',
            'Upload Error'
          );
        } else {
          this.toastr.error('Failed to upload document.', 'Error');
        }
      }
    );
  }

  getServicePrice(serviceName: string): number {
    const service = this.availableServices.find(
      (s) => s.serviceName === serviceName
    );
    if (!service) {
      console.warn(`Service not found: ${serviceName}`);
      return 0; // Return 0 if the service is not found
    }
    return service.price;
  }

  getVendorPrice(types: string[]): number {
    if (!Array.isArray(types) || types.length === 0) {
      console.warn('No types provided or invalid type field.');
      return 0; // Return 0 if the type field is empty or invalid
    }

    return types.reduce((total, vendorName) => {
      const vendor = this.availableVendors.find(
        (v) => v.vendorName === vendorName
      );
      if (!vendor) {
        console.warn(`Vendor not found: ${vendorName}`);
        return total; // Skip if the vendor is not found
      }
      if (!vendor.feeAmount) {
        console.warn(`Fee amount not defined for vendor: ${vendorName}`);
      }
      return total + (vendor.feeAmount || 0); // Add the vendor's fee amount to the total
    }, 0);
  }

  getSubtotal(): number {
    if (!this.selectedSaleOrder?.type) {
      return 0;
    }
    return this.selectedSaleOrder.type.reduce(
      (total: number, serviceName: string) => {
        const service = this.availableServices.find(
          (s) => s.serviceName === serviceName
        );
        return total + (service?.price || 0);
      },
      0
    );
  }

  onFileChange(event: Event, key: string, isMultiple: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf'];
      const invalidFiles = files.filter((file) => {
        const fileExtension = file.name.split('.').pop()?.toLowerCase();
        return !fileExtension || !allowedExtensions.includes(fileExtension);
      });

      if (invalidFiles.length > 0) {
        this.fileError = `Invalid file type. Allowed types: ${allowedExtensions.join(
          ', '
        )}`;
        return;
      }

      // File size validation (10 MB = 10485760 bytes)
      const oversizedFile = files.find(file => file.size > 10485760);
      if (oversizedFile) {
        this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
        input.value = '';
        return;
      }

      this.fileError = null; // Clear any previous error
      if (isMultiple) {
        this.newSales[key] = [...(this.newSales[key] || []), ...files];
      } else {
        if (key === 'expenseuploadDocument') {
          this.newExpense['expenseUploadDocument'] = files[0];
          this.selectedFiles[key] = files[0];
        } else {
          this.newSales[key] = files[0]; // Single file for uploadSalesDocument
          this.selectedFiles[key] = files[0]; // Update selectedFiles for display
        }
      }
      input.value = ''; // Clear the input value to allow re-upload of the same file
    }
  }

  removeFile(file: File, key: string): void {
    this.newSales[key] = this.newSales[key].filter((f: File) => f !== file);
  }

  getSaleCategoryTotal(sale: any): number {
    if (!sale.categories || !Array.isArray(sale.categories)) return 0;
    return sale.categories.reduce(
      (sum: number, cat: any) => sum + (cat.amount || 0),
      0
    );
  }

  addExpenseRow() {
    // Always add with quantity: 1 and amount: 0
    const expenseGroup = this.fb.group({
      category: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      amount: [0, Validators.required],
    });
    this.expenseTypeControls.push(expenseGroup);
  }

  removeExpenseRow(i: number) {
    const arr = this.expenseForm.get('categories') as FormArray;
    if (arr.length > 1) {
      arr.removeAt(i);
      this.ensureAtLeastOneExpenseCategory();

    }
  }

  clearAllExpenseRows() {
    // Remove all rows
    while (this.expenseTypeControls.length !== 0) {
      this.expenseTypeControls.removeAt(0);
    }
    // Always add one default row
    this.expenseTypeControls.push(this.createExpenseRow());
  }

  onCategoryChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedCategory = selectElement.value;
    const selectedAccount = this.filteredAccountingData.find(
      (account) => account.accountName === selectedCategory
    );
  }

  // Add this method for Add Expense form
  onExpenseVendorChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedVendorName = selectElement.value;
    const vendor = this.availableVendors.find(
      (v) => v.vendorName === selectedVendorName
    );
    if (vendor) {
      const address = [
        vendor.streetAddress,
        vendor.stateProvince,
        vendor.country,
        vendor.zipPostalCode,
      ]
        .filter(Boolean)
        .join(', ');
      this.expenseForm.patchValue({ mailingAddress: address });
    } else {
      this.expenseForm.patchValue({ mailingAddress: '' });
    }
  }

  // Add this method for Edit Expense form
  onEditExpenseVendorChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedVendorName = selectElement.value;
    const vendor = this.availableVendors.find(
      (v) => v.vendorName === selectedVendorName
    );
    if (vendor && this.editExpenseForm) {
      const address = [
        vendor.streetAddress,
        vendor.stateProvince,
        vendor.country,
        vendor.zipPostalCode,
      ]
        .filter(Boolean)
        .join(', ');
      this.editExpenseForm.patchValue({ mailingAddress: address });
    } else if (this.editExpenseForm) {
      this.editExpenseForm.patchValue({ mailingAddress: '' });
    }
  }

  // Add this method to set up the auto-calculation
  setupDueDateAutoCalculation() {
    this.salesOrderForm.get('terms')?.valueChanges.subscribe(() => {
      this.updateDueDate();
    });
    this.salesOrderForm.get('invoiceDate')?.valueChanges.subscribe(() => {
      this.updateDueDate();
    });
  }

  // Add this method to calculate and set the due date
  updateDueDate() {
    const terms = this.salesOrderForm.get('terms')?.value;
    const invoiceDate = this.salesOrderForm.get('invoiceDate')?.value;
    if (!terms || !invoiceDate) {
      this.salesOrderForm.get('duedate')?.setValue('');
      return;
    }

    let daysToAdd = 0;
    switch (terms) {
      case 'Due on receipt':
        daysToAdd = 0;
        break;
      case '7 Days':
        daysToAdd = 7;
        break;
      case '15 Days':
        daysToAdd = 15;
        break;
      case '30 Days':
        daysToAdd = 30;
        break;
      case '45 Days':
        daysToAdd = 45;
        break;
      default:
        daysToAdd = 0;
    }

    const date = new Date(invoiceDate);
    date.setDate(date.getDate() + daysToAdd);
    // Format as yyyy-MM-dd for input[type="date"]
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const dueDateStr = `${yyyy}-${mm}-${dd}`;
    this.salesOrderForm.get('duedate')?.setValue(dueDateStr);
  }

  // Auto-fill mailing address when customer changes in sales order form
  onSalesCustomerChange(event: Event): void {
    const selectedCustomerName = (event.target as HTMLSelectElement).value;
    const selectedCompany = this.companies.find(
      (company) => company.companyName === selectedCustomerName
    );
    if (selectedCompany) {
      const address = [
        selectedCompany.phyStreet,
        selectedCompany.phyCity,
        selectedCompany.phyState,
        selectedCompany.phyZipcode,
      ]
        .filter(Boolean)
        .join(', ');
      this.salesOrderForm.patchValue({
        mailingAddress: address,
      });
    } else {
      this.salesOrderForm.patchValue({
        mailingAddress: '',
      });
    }
  }

  openEditSalesOrderModal(sale: any): void {
    this.editingSalesOrderId = sale._id;

    // Patch main form values
    this.editSalesOrderForm.patchValue({
      customerName: sale.customerName || '',
      customerRef: sale.customerRef || '',
      mailingAddress: sale.mailingAddress || '',
      invoiceDate: sale.invoiceDate ? sale.invoiceDate.substring(0, 10) : '',
      terms: sale.terms || '',
      duedate: sale.duedate ? sale.duedate.substring(0, 10) : '',
      notes: sale.notes || '',
    });

    // Clear existing categories first
    const categoriesArray = this.editSalesOrderForm.get(
      'categories'
    ) as FormArray;
    while (categoriesArray.length) {
      categoriesArray.removeAt(0);
    }

    // If less than 2 categories, show only 2 empty rows (do not show fetched data)
    if (!sale.categories || sale.categories.length < 2) {
      for (let i = 0; i < 2; i++) {
        categoriesArray.push(
          this.fb.group({
            category: [[], Validators.required],
            description: [''],
            quantity: [1, [Validators.required, Validators.min(1)]],
            amount: [0, [Validators.required, Validators.min(0)]],
          })
        );
      }
    } else {
      // If 2 or more, show fetched data as rows
      sale.categories.forEach((category: any) => {
        categoriesArray.push(
          this.fb.group({
            category: [category.category || [], Validators.required],
            description: [category.description || ''],
            quantity: [
              category.quantity || 1,
              [Validators.required, Validators.min(1)],
            ],
            amount: [
              category.amount || 0,
              [Validators.required, Validators.min(0)],
            ],
          })
        );
      })
    }

    // Set the uploaded document reference if it exists
    if (sale.salesuploadDocument) {
      this.selectedFiles['editSalesuploadDocument'] = {
        name: sale.salesuploadDocument.split('/').pop() || 'Uploaded document',
      };
    }

    // Set existing document URL
    this.existingDocumentUrl = sale.salesuploadDocument || '';

    // Open modal using Bootstrap's Offcanvas API
    const modal = document.getElementById('editSalesOrderModal');
    if (modal) {
      let bsOffcanvas = (
        window as any
      ).bootstrap?.Offcanvas?.getOrCreateInstance(modal);
      if (!bsOffcanvas) {
        bsOffcanvas = new (window as any).bootstrap.Offcanvas(modal);
      }
      bsOffcanvas.show();
    }
  }

  // Update the addCategory method to accept initial values

  addCategory(categoryData?: any, formArray?: FormArray): void {
    const group = this.fb.group({
      category: [categoryData?.category || [], Validators.required],
      description: [categoryData?.description || ''],
      quantity: [
        categoryData?.quantity || 1,
        [Validators.required, Validators.min(1)],
      ],
      amount: [categoryData?.amount || 0], // ✅ Add this line
    });

    // Push to the correct form array
    if (formArray) {
      formArray.push(group);
    } else {
      this.categoryControls.push(group);
    }
  }

  onUpdateSalesOrder(): void {
    this.editSalesOrderForm.markAllAsTouched();
    this.editSalesOrderForm.updateValueAndValidity();

    if (!this.editingSalesOrderId) {
      this.toastr.error('No sales order selected for update.', 'Error');
      return;
    }

    if (this.editSalesOrderForm.invalid) {
      this.toastr.error(
        'Please fill all required fields correctly.',
        'Validation Error'
      );
      return;
    }

    const formData = new FormData();
    const formValues = this.editSalesOrderForm.value;
    const categories = formValues.categories;

    // Append all fields except categories
    Object.keys(formValues).forEach((key) => {
      if (
        key !== 'categories' &&
        formValues[key] !== null &&
        formValues[key] !== undefined
      ) {
        formData.append(key, formValues[key]);
      }
    });

    // Append categories
    if (Array.isArray(categories)) {
      categories.forEach((cat, idx) => {
        Object.keys(cat).forEach((key) => {
          formData.append(`categories[${idx}][${key}]`, cat[key]);
        });
      });
    }

    // Append file if selected
    if (this.selectedFiles?.['editSalesuploadDocument']) {
      formData.append(
        'salesuploadDocument',
        this.selectedFiles['editSalesuploadDocument']
      );
    }

    // Start loading
    this.isLoading = true;

    this.accountingService
      .updateSalesOrderPermit(this.editingSalesOrderId, formData)
      .subscribe({
        next: () => {
          this.toastr.success('Sales order updated successfully!', 'Success');
          this.isLoading = false;

          // Optional: reset form if needed
          this.editSalesOrderForm.reset();

          // Delay to allow Toastr to show before reload
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        error: (error) => {
          this.toastr.error(
            'Failed to update sales order. Please try again.',
            'Error'
          );
          this.isLoading = false;
        },
      });
  }

  closeModal(): void {
    const modal = document.getElementById('editSalesOrderModal');
    if (modal) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    }
    this.editSalesOrderForm.reset();
    this.selectedFiles = {};
    this.existingDocumentUrl = '';
  }

  // --- Add this method for due date calculation in edit form ---
  updateEditFormDueDate(): void {
    const invoiceDate = this.editSalesOrderForm.get('invoiceDate')?.value;
    const terms = this.editSalesOrderForm.get('terms')?.value;
    if (invoiceDate && terms) {
      let days = 0;
      // Try to extract number of days from terms (e.g., 'Net 30')

      const match = /\d+/.exec(terms);
      if (match) {

        days = parseInt(match[0], 10);
      }
      const due = new Date(invoiceDate);
      due.setDate(due.getDate() + days);
      this.editSalesOrderForm
        .get('duedate')
        ?.setValue(due.toISOString().substring(0, 10), { emitEvent: false });
    }
  }
  get editCategoryControls(): FormArray {
    return this.editSalesOrderForm && this.editSalesOrderForm.get('categories')
      ? (this.editSalesOrderForm.get('categories') as FormArray)
      : this.fb.array([]);
  }
  onEditCategoryServiceChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedOptions = Array.from(selectElement.selectedOptions).map(

      (option) => option.value
    );
    this.editCategoryControls
      .at(index)
      .get('category')
      ?.setValue(selectedOptions);

    // Calculate amount for selected services
    const totalAmount = selectedOptions.reduce((sum, serviceName) => {
      const service = this.availableServices.find(

        (s) => s.serviceName === serviceName
      );
      return sum + (service?.price || 0);
    }, 0);
    this.editCategoryControls.at(index).get('amount')?.setValue(totalAmount);
  }

  removeEditCategory(index: number): void {
    const categories = this.editSalesOrderForm.get('categories') as FormArray;
    if (categories && categories.length > 1) {
      // Change to 2 if you want minimum 2
      categories.removeAt(index);
    }
  }

  // --- Add file upload handler for edit form ---
  onEditSalesFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFiles['editSalesuploadDocument'] = file;
    }
  }
  // // // --- Add this method for due date calculation in edit form ---
  setupEditFormDueDateAutoCalculation = () => {
    this.editSalesOrderForm.get('terms')?.valueChanges.subscribe(() => {
      this.updateEditFormDueDate();
    });
    this.editSalesOrderForm.get('invoiceDate')?.valueChanges.subscribe(() => {
      this.updateEditFormDueDate();
    });
  };

  // Add these methods to support edit modal category actions
  addEditCategory(): void {
    const categoriesArray = this.editSalesOrderForm.get('categories') as FormArray;
    categoriesArray.push(
      this.fb.group({
        category: [[], Validators.required],
        description: [''],
        quantity: [1, [Validators.required, Validators.min(1)]],
        amount: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }



  clearEditCategories(): void {
    const categoriesArray = this.editSalesOrderForm.get(
      'categories'
    ) as FormArray;
    while (categoriesArray.length) {
      categoriesArray.removeAt(0);
    }
    // Always keep at least two rows
    for (let i = 0; i < 2; i++) {
      categoriesArray.push(
        this.fb.group({
          category: [[], Validators.required],
          description: [''],
          quantity: [1, [Validators.required, Validators.min(1)]],
          amount: [0, [Validators.required, Validators.min(0)]],
        })
      );
    }
  }

  // --- Edit Expense Form ---
  editExpenseForm: FormGroup = this.fb.group({}); // Always defined, never undefined
  editingExpenseId: string | null = null;
  existingExpenseDocumentUrl: string = '';

  openEditExpenseModal(expense: any): void {
    // Ensure categories are loaded before anything else
    if (!this.filteredAccountingData || this.filteredAccountingData.length === 0) {
      this.loadAccountPermitData();
    }
    this.editingExpenseId = expense._id;
    if (this.editExpenseForm) {
      this.editExpenseForm.patchValue({
        vendorName: expense.vendorName || '',
        vendorRefrence: expense.vendorRefrence || '',
        billNumber: expense.billNumber || '',
        mailingAddress: expense.mailingAddress || '',
        terms: expense.terms || '',
        billDate: expense.billDate ? expense.billDate.substring(0, 10) : '',
        duedate: expense.duedate ? expense.duedate.substring(0, 10) : '',
        paymentMethodByField: expense.paymentMethodByField || '',
        notes: expense.notes || '',
        paymentId: expense.paymentId || '',
        paymentType: expense.paymentType || '',
        refrenceId: expense.refrenceId || '',
        paymentDate: expense.paymentDate || '',
        paidAmount: expense.paidAmount || '',
        paymentMethod: expense.paymentMethod || '',
        account: expense.account || '',
        transectionNotes: expense.transectionNotes || '',
        status: expense.status || 'Not Generated',
        status1: expense.status1 || 'Pending',
        createdBy: expense.createdBy || '',
        adminId: expense.adminId || '',
        superadminId: expense.superadminId || '',
        updatedBy: expense.updatedBy || '',
        companyId: expense.companyId || '',
      });
    }

    // Always clear and repopulate categories FormArray
    const categoriesArray = this.editExpenseForm.get('categories') as FormArray;
    while (categoriesArray.length) categoriesArray.removeAt(0);
    if (expense.categories && expense.categories.length) {
      expense.categories.forEach((cat: any) =>
        this.addEditExpenseCategory(cat)
      );
    } else {
      // Always keep at least two rows
      for (let i = 0; i < 2; i++) {
        this.addEditExpenseCategory();
      }
    }

    // Set file if exists
    if (expense.expenseUploadDocument) {
      this.selectedFiles['editExpenseUploadDocument'] = {
        name:
          expense.expenseUploadDocument.split('/').pop() || 'Uploaded document',
      };
    }
    this.existingExpenseDocumentUrl = expense.expenseUploadDocument || '';

    // Open modal using Bootstrap's Offcanvas API
    const modal = document.getElementById('editExpenseModal');
    if (modal) {
      let bsOffcanvas = (
        window as any
      ).bootstrap?.Offcanvas?.getOrCreateInstance(modal);
      if (!bsOffcanvas) {
        bsOffcanvas = new (window as any).bootstrap.Offcanvas(modal);
      }
      bsOffcanvas.show();
    }
  }

  addEditExpenseCategory(categoryData?: any): void {
    // Ensure category is always a string for the select
    let categoryValue = '';
    if (categoryData?.category) {
      if (Array.isArray(categoryData.category)) {
        categoryValue = categoryData.category[0] || '';
      } else {
        categoryValue = categoryData.category;
      }
    }
    // Always set quantity: 1 and amount: 0 as default if not provided
    const group = this.fb.group({
      category: [categoryValue, Validators.required],
      description: [categoryData?.description || ''],
      quantity: [
        categoryData?.quantity != null ? categoryData.quantity : 1,
        [Validators.required, Validators.min(1)],
      ],
      amount: [
        categoryData?.amount != null ? categoryData.amount : 0,
        [Validators.required, Validators.min(0)],
      ],
    });
    if (this.editExpenseForm) {
      (this.editExpenseForm.get('categories') as FormArray).push(group);
    }
  }

  clearEditExpenseCategories(): void {
    if (!this.editExpenseForm) return;
    const categoriesArray = this.editExpenseForm.get('categories') as FormArray;
    while (categoriesArray.length) categoriesArray.removeAt(0);
    // Always keep at least two rows with quantity: 1 and amount: 0
    for (let i = 0; i < 2; i++) {
      categoriesArray.push(
        this.fb.group({
          category: ['', Validators.required],
          description: [''],
          quantity: [1, [Validators.required, Validators.min(1)]],
          amount: [0, [Validators.required, Validators.min(0)]],
        })
      );
    }
  }

  removeEditExpenseCategory(index: number): void {
    if (!this.editExpenseForm) return;
    const categories = this.editExpenseForm.get('categories') as FormArray;
    if (categories && categories.length > 1) {
      categories.removeAt(index);
    }
  }

  onEditExpenseFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFiles['editExpenseUploadDocument'] = file;
    }
  }
  onUpdateExpense(): void {
    if (this.editExpenseForm) {
      this.editExpenseForm.markAllAsTouched();
      this.editExpenseForm.updateValueAndValidity();
    }
    if (!this.editingExpenseId) {
      this.toastr.error('No expense selected for update.', 'Error');
      return;
    }

    const formData = new FormData();
    const formValues = this.editExpenseForm.value;

    // Filter out empty/invalid categories
    const categories = (formValues.categories || []).filter(
      (cat: any) =>
        cat &&
        cat.category &&
        (typeof cat.category === 'string'
          ? cat.category.trim() !== ''
          : Array.isArray(cat.category)
            ? cat.category.length > 0
            : false)
    );

    // Append all form values except categories and expenseUploadDocument
    Object.keys(formValues).forEach((key) => {
      if (
        key !== 'categories' &&
        key !== 'expenseUploadDocument' &&
        formValues[key] !== null &&
        formValues[key] !== undefined
      ) {
        formData.append(key, formValues[key]);
      }
    });

    // Append categories as array of objects
    if (Array.isArray(categories)) {
      categories.forEach((cat, idx) => {
        Object.keys(cat).forEach((key) => {
          formData.append(`categories[${idx}][${key}]`, cat[key]);
        });
      });
    }

    // Append file if selected
    if (this.selectedFiles['editExpenseUploadDocument']) {
      formData.append(
        'expenseUploadDocument',
        this.selectedFiles['editExpenseUploadDocument']
      );
    }

    this.isLoading = true;
    this.accountingService
      .updateExpensePermit(this.editingExpenseId, formData)
      .subscribe({
        next: () => {
          this.toastr.success('Expense updated successfully!', 'Success');
          this.editExpenseForm.reset();
          this.isLoading = false;
          // Close the modal
          this.closeEditExpenseModal();
          // Reload the page to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        },
        error: (error) => {
          this.toastr.error(
            'Failed to update expense. Please try again.',
            'Error'
          );
          this.isLoading = false;
        },
      });
  }

  closeEditExpenseModal(): void {
    const modal = document.getElementById('editExpenseModal');
    if (modal) {
      const bsModal = (window as any).bootstrap.Modal.getInstance(modal);
      if (bsModal) bsModal.hide();
    }
    if (this.editExpenseForm) {
      this.editExpenseForm.reset();
    }
    this.selectedFiles['editExpenseUploadDocument'] = null;
    this.existingExpenseDocumentUrl = '';
  }

  get editExpenseCategoryControls(): FormArray {
    return this.editExpenseForm && this.editExpenseForm.get('categories')
      ? (this.editExpenseForm.get('categories') as FormArray)
      : this.fb.array([]);
  }

  onEditExpenseCategoryChange(event: Event, index: number): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedCategory = selectElement.value;
    this.editExpenseCategoryControls
      .at(index)
      .get('category')
      ?.setValue(selectedCategory);
    // Optionally recalculate amount if needed
  }

  onCategoryQuantityChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const quantity = Number(input.value) || 0;
    const selectedServices =
      this.categoryControls.at(index).get('category')?.value || [];

    const totalServicePrice = selectedServices.reduce(
      (sum: number, serviceName: string) => {
        const service = this.availableServices.find(
          (s) => s.serviceName === serviceName
        );
        return sum + (service?.price || 0);
      },
      0
    );
    const newAmount = quantity * totalServicePrice;
    this.categoryControls.at(index).get('amount')?.setValue(newAmount);
  }

  onEditCategoryQuantityChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const quantity = Number(input.value) || 0;
    const selectedServices =
      this.editCategoryControls.at(index).get('category')?.value || [];
    // Calculate total price for selected services
    const totalServicePrice = selectedServices.reduce(
      (sum: any, serviceName: any) => {
        const service = this.availableServices.find(
          (s) => s.serviceName === serviceName
        );
        return sum + (service?.price || 0);
      },
      0
    );
    this.editCategoryControls
      .at(index)
      .get('amount')
      ?.setValue(quantity * totalServicePrice);
  }

  onExpenseQuantityChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const quantity = Number(input.value);

    const controlGroup = this.expenseTypeControls.at(index);
    const amountControl = controlGroup.get('amount');
    const baseAmountControl = controlGroup.get('baseAmount');

    // Use baseAmount for calculations
    if (amountControl && baseAmountControl) {
      const baseAmount = Number(baseAmountControl.value) || 0;
      if (baseAmount > 0 && quantity > 0) {
        amountControl.setValue(baseAmount * quantity, { emitEvent: false });
      }
    }
  }
  onEditExpenseQuantityChange(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const quantity = Number(input.value) || 0;
    const selectedCategory = this.editExpenseCategoryControls
      .at(index)
      .get('category')?.value;
    let fee = 0;
    if (selectedCategory) {
      const vendor = this.availableVendors.find(
        (v) => v.vendorName === selectedCategory
      );
      fee = vendor?.feeAmount || 0;
    }
    this.editExpenseCategoryControls
      .at(index)
      .get('amount')
      ?.setValue(quantity * fee);
  }

  // Helper to parse terms and return number of days (e.g. 'Net 30' => 30)
  private getDaysFromTerms(terms: string): number {
    if (!terms) return 0;
    const match = terms.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  }

  // For Add Expense form
  updateExpenseDueDate(): void {
    const billDate = this.expenseForm.get('billDate')?.value;
    const terms = this.expenseForm.get('terms')?.value;
    if (billDate && terms) {
      const days = this.getDaysFromTerms(terms);
      const due = new Date(billDate);
      due.setDate(due.getDate() + days);
      // Format as yyyy-MM-dd for input type="date"
      const dueStr = due.toISOString().slice(0, 10);
      this.expenseForm.get('duedate')?.setValue(dueStr, { emitEvent: false });
    }
  }

  // For Edit Expense form
  updateEditExpenseDueDate(): void {
    const billDate = this.editExpenseForm.get('billDate')?.value;
    const terms = this.editExpenseForm.get('terms')?.value;
    if (billDate && terms) {
      const days = this.getDaysFromTerms(terms);
      const due = new Date(billDate);
      due.setDate(due.getDate() + days);
      const dueStr = due.toISOString().slice(0, 10);
      this.editExpenseForm
        .get('duedate')
        ?.setValue(dueStr, { emitEvent: false });
    }
  }

  /**
   * Calculates the subtotal for the selected sale order's categories.
   * Returns the sum of (amount * quantity) for each category in selectedSaleOrder.categories.
   */
  getSaleCategoriesSubtotal(): number {
    if (
      !this.selectedSaleOrder ||
      !Array.isArray(this.selectedSaleOrder.categories)
    ) {
      return 0;
    }
    return this.selectedSaleOrder.categories.reduce(
      (subtotal: number, cat: any) => {
        const amount = Number(cat.amount) || 0;
        const quantity = Number(cat.quantity) || 1;
        return subtotal + amount * quantity;
      },
      0
    );
  }

  // Auto-fill mailing address when customer changes in edit sales order form
  onEditSalesCustomerChange(event: Event): void {
    const selectedCustomerName = (event.target as HTMLSelectElement).value;
    const selectedCompany = this.companies.find(
      (company) => company.companyName === selectedCustomerName
    );
    if (selectedCompany) {
      const address = [
        selectedCompany.phyStreet,
        selectedCompany.phyCity,
        selectedCompany.phyState,
        selectedCompany.phyZipcode,
      ]
        .filter(Boolean)
        .join(', ');
      this.editSalesOrderForm.patchValue({
        mailingAddress: address,
      });
    } else {
      this.editSalesOrderForm.patchValue({
        mailingAddress: '',
      });
    }
  }

  // Delete a sales order
  deleteSalesOrder(sale: any): void {
    if (!sale || !sale._id) {
      this.toastr.error('Invalid sales order selected for deletion.');
      return;
    }
    if (confirm('Are you sure you want to delete this sales order?')) {
      this.accountingService.deleteSalesOrderPermit(sale._id).subscribe(
        () => {
          this.toastr.success('Sales order deleted successfully.');
          // Remove from local list
          this.salesOrders = this.salesOrders.filter((s) => s._id !== sale._id);
          this.filteredSalesOrders = this.filteredSalesOrders.filter(
            (s) => s._id !== sale._id
          );
        },
        (error) => {
          this.toastr.error('Failed to delete sales order.');
        }
      );
    }
  }

  // Delete an expense
  deleteExpense(expense: any): void {
    if (!expense || !expense.expenseId) {
      this.toastr.error('Invalid expense selected for deletion.');
      return;
    }
    if (confirm('Are you sure you want to delete this expense?')) {
      this.accountingService.deleteExpensePermit(expense.expenseId).subscribe(
        () => {
          this.toastr.success('Expense deleted successfully.');
          // Remove from local list
          this.expenses = this.expenses.filter(
            (e) => e.expenseId !== expense.expenseId
          );
          this.filteredExpenseOrders = this.filteredExpenseOrders.filter(
            (e) => e.expenseId !== expense.expenseId
          );
        },
        (error) => {
          this.toastr.error('Failed to delete expense.');
        }
      );
    }
  }

  /**
   * Returns the total for all categories in the sales order form (sum of quantity * amount for each row)
   */
  getSalesOrderCategoriesTotal(): number {
    const categories = this.salesOrderForm.get('categories')?.value;
    if (!Array.isArray(categories)) return 0;
    return categories.reduce((sum, cat) => {
      const qty = Number(cat.quantity) || 1;
      const amt = Number(cat.amount) || 0;
      return sum + qty * amt;
    }, 0);
  }
  ensureAtLeastOneExpenseCategory() {
    const categories = this.expenseForm.get('categories') as FormArray | null;
    if (categories) {
      while (categories.length < 1) {
        categories.push(this.createExpenseRow());
      }
    }
  }
  onVendorDropdownClick() {
    // Ensure uniqueVendors is up to date and trigger change detection
    this.uniqueVendors = [...new Set(this.expenses.map(expense => expense.vendorName))];
    this.cdr.detectChanges();
  }
  searchAccounts() {
    const term = this.accountSearchTerm.trim().toLowerCase();
    if (!term) {
      this.accounts = [...this.filteredAccountingData];
    } else {
      this.accounts = this.filteredAccountingData.filter(account =>
        (account.accountId || '').toLowerCase().includes(term) ||
        (account.accountName || '').toLowerCase().includes(term) ||
        (account.type || '').toLowerCase().includes(term) ||
        (account.description || '').toLowerCase().includes(term)
      );
    }
    this.currentAccountsPage = 1;
  }
  searchSalesOrders() {
    const term = this.salesOrderSearchTerm.trim().toLowerCase();
    if (!term) {
      this.salesOrders = [...this.filteredSalesOrders];
    } else {
      this.salesOrders = this.filteredSalesOrders.filter(order =>
        (order.orderId || '').toLowerCase().includes(term) ||
        (order.customerName || '').toLowerCase().includes(term) ||
        (order.status || '').toLowerCase().includes(term) ||
        (order.invoiceDate || '').toLowerCase().includes(term)
      );
    }
    this.currentSalesOrdersPage = 1;
  }

  searchExpenses() {
    const term = this.expenseSearchTerm.trim().toLowerCase();
    if (!term) {
      this.expenses = [...this.filteredExpenseOrders];
    } else {
      this.expenses = this.filteredExpenseOrders.filter(expense =>
        (expense.expenseId || '').toLowerCase().includes(term) ||
        (expense.vendorName || '').toLowerCase().includes(term) ||
        (expense.status || '').toLowerCase().includes(term) ||
        (expense.billDate || '').toLowerCase().includes(term)
      );
    }
    this.currentExpensesPage = 1;
  }

}