import { Component, OnInit, Renderer2 } from '@angular/core';
import { formatDate } from '@angular/common';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SharedUtilityService } from '../../shared/shared-utility.service';
import { ElementRef } from '@angular/core';
export enum CRMStatus {
  PROSPECT = 'prospect',
  NEW = 'new',
  CLIENT = 'client',
  LOST = 'lost',
}

interface InsuranceEntry {
  insuranceType: string;
  companyInsuranceName: string;
  policyNumber: string;
  policyStartDate: string;
  policyExpirationDate: string;
  insuranceuploadDocument?: File | null;
}
interface TaskEntry {
  title: string;
  description: string;
  dueDate: string;
  priority: string;
  assignedTo: string;
  relatedTo: string;
  companyId?: string;
  carrierContact?: string;

  // ✅ new properties
  createdBy?: string;
  createdAt?: Date;
  completedBy?: string;
  completedAt?: Date;
}





// Define an interface for compliance documents
interface ComplianceDocument {
  complianceType?: string;
  documentName?: string;
  complianceuploadDocument?: File | null;
}

@Component({
  selector: 'app-crm',
  templateUrl: './crm.component.html',
  styleUrl: './crm.component.css'
})


export class CrmComponent {
  selectedCarrierId: any;
  // submitForm(f) {
  // throw new Error('Method not implemented.');
  // }
  onAddCarrier() {
    throw new Error('Method not implemented.');
  }




  // new code of 21 aug



  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; // reset first
    textarea.style.height = textarea.scrollHeight + 'px'; // set to content height
  }

  // new code of 21 aug


  carrierContacts: any[] = [];
  newContact: any = {};   // used for Add/Edit form
  editingContactId: string | null = null;

  crmList: any[] = [];
  editingCrm: any = null;

  serviceOptions = [
    { label: 'Compliance', id: 'serviceCompliance' },
    { label: 'ELD', id: 'serviceEld' },
    { label: 'TMS', id: 'serviceTms' },
    { label: 'Factoring', id: 'serviceFactoring' },
    { label: 'Fuel Cards', id: 'serviceFuel' }




  ];
  viewCrmDetails(company: any) {
    this.selectedCrm = company;
    this.loadActivityLogs();
    this.loadUsersForCompany();
    this.loadAllNotes();

  }

  entries: any = {

    // Company Info
    carrierName: '',
    contact: '',
    status: '',
    services: [],
    lastContact: '',
    createdBy: '',
    mcNumber: '',
    name: '',
    title: '',
    phone: '',
    email: '',
    dot: '',
    companyName: '',
    ein: '',
    mc: '',
    phyStreet: '',
    phyCity: '',
    phyZipcode: '',
    phyState: '',
    phoneNumber: '',
    companyEmail: '',
    caNumber: '',
    CompanyDBA: '',
    corporation: '',
    companyType: '',
    iftaAcc: '',
    prepass: '',
    irpAcc: '',
    irpRenewalDate: '',
    operatingAuthority: '',
    // Insurance Info
    insuranceBrokerName: '',
    companyPhysicalAddress: '',
    companyMailingAddress: '',
    companyEmailAddress: '',
    Contact: '',
    insuranceType: '',
    insuranceEntries: [],
    // Compliance Info
    accountsPermits: {
      prepassAccountNumber: '',
      iftaAccountNumber: '',
      ucrNumber: ''
    },
    complianceDocuments: {},
    kyu: '',
    kyuUploadDocument: null,
    kyuExpiration: '',
    ny: '',
    nyUploadDocument: null,
    nyExpiration: '',
    w9UploadDocument: null,
    irpRenewal: '',
    usDOTRegistrationUploadDocument: null,
    mcCertificateUploadDocument: null,
    iftaRegistrationUploadDocument: null,
    insuranceDocument: null,
    // Accounts & Permits
    prepassAccountNumber: '',
    iftaAccountNumber: '',
    ucrNumber: '',
    // Documentation
    legalName: '',
    // Add any other fields needed for edit modal here
  };
  taskEntries: TaskEntry = {
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    assignedTo: '',
    relatedTo: '',
    createdBy: '',
    carrierContact: '',
    createdAt: new Date(),
  };
  isLoadingNotes: boolean = false;

  notes: any[] = [];
  newNote: string = '';
  editingNoteId: string | null = null;


  selectedTask: any; // Consider creating a proper interface for this too



  // Selected CRM for display
  selectedCrm: any = null;

  // On form submit, update selectedCrm
  onSubmit() {
    this.selectedCrm = { ...this.entries };
  }



  //new code of 31 july


  // Compliance :'',
  //  ELD :'',
  //  TMS :'',
  //  Factoring :'',
  // FuelCards :'',
  CRMStatus = CRMStatus; // Expose enum to template
  taskList: any[] = [];
  // activeTasks: any[] = [];   
  // completedTasks: any[] = []; 
  editingTask: any = null;
  selectedInsuranceType: string = '';
  insuranceForm: FormGroup;
  isSidebarOpen = true;
  activeSection: string = 'company-info';
  activeTab: string = 'companyList';
  companyId: string | null = null;
  companies: any[] = [];
  filteredCompanies: any[] = [];
  searchQuery: string = '';
  users: any[] = [];
  newCompany: any = {
    insuranceEntries: [],
    accountsPermits: {
      prepassAccountNumber: '',
      iftaAccountNumber: '',
      ucrNumber: ''
    },
    complianceDocuments: {
      usDOTRegistrationUploadDocument: null,
      mcCertificateUploadDocument: null,
      iftaRegistrationUploadDocument: null,
    },
    dot: ''
  };
  newUser: any = {
    name: '',
    email: '',
    role: '',
    companyId: '',
    password: '',
    permissions: {
      truckList: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      trailerList: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      driverList: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      driverApplication: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      companyList: {
        create: false,
        read: false,
        update: false,
        delete: false
      }
    }
  };
  showAddUserForm: boolean = false;
  selectedCompany: any = {};
  private dotTimeout: any = null;
  highlightedCompany: any = null;
  insuranceFileNames: { [key: number]: string } = {}; // Store file names for insuranceEntries
  complianceFilesNames: { [key: string]: string } = {}; // Store file names for complianceDocuments
  generalFileNames: { [key: string]: string } = {}; // Store file names for general case
  currentPage: number = 1;
  itemsPerPage: number = 15;
  paginatedCompanies: any[] = [];
  totalPages: number = 0;
  totalPagesArray: number[] = [];
  carriers: any;
  isModalVisible = false;
  isLoading: boolean = false;


  activityTypes = [
    { label: 'All Activity', value: 'all', icon: 'fa-list', color: 'secondary' },
    { label: 'Call', value: 'call', icon: 'fa-phone', color: 'primary' },
    { label: 'Email', value: 'email', icon: 'fa-envelope', color: 'danger' },
    { label: 'Text', value: 'text', icon: 'fa-sms', color: 'info' },
    { label: 'Meeting', value: 'meeting', icon: 'fa-calendar-alt', color: 'info' },
    { label: 'Note', value: 'note', icon: 'fa-sticky-note', color: 'info' }
  ];

  selectedActivityType = 'all';

  activityForm = {
    details: '',
    outcome: '',
  };

  activityLogs: any[] = [];
  isLoadingActivity = false;
  superAdminUsers: any[] = [];
  filteredSuperAdminUsers: any[] = [];
  currentUser: any = null;

  get filteredActivityLogs() {
    let logs = this.activityLogs;

    if (this.selectedActivityType !== 'all') {
      logs = logs.filter(log => log.type === this.selectedActivityType);
    }

    // 🔹 latest first (createdAt ke hisaab se sort)
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }











  constructor(
    private elRef: ElementRef,
    private serviceAuthService: ServiceAuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private sharedUtilityService: SharedUtilityService,
    private renderer: Renderer2 // Add this line
  ) {
    this.insuranceForm = this.fb.group({
      insuranceType: ['', Validators.required],
      policies: this.fb.array([])
    });
  }

  ngOnInit(): void {
    // 1. Always load logged-in user first
    this.loadCarrierContacts();
    this.loadCurrentUser();
    this.loadAllNotes();

    // 2. Load CRM and tasks (they need currentUser info like name/role)

    this.loadAllTasks();

    // 3. Load company + users (independent)
    this.loadCompany();
    this.loadUsers();

    // 4. UI setup
    this.setupOffcanvasClose();

    // 5. Handle route params (company profile)
    this.route.params.subscribe(params => {
      const companyId = params['id'];
      if (companyId) {
        this.getCompanyById(companyId);
      }
    });

    // 6. Pagination init
    this.calculateTotalPages();
    this.updatePaginatedCompanies();
  }


  onInsuranceTypeChange(event: any) {
    this.selectedInsuranceType = event.target.value;
    console.log('Selected Insurance Type:', this.selectedInsuranceType);
    if (this.selectedInsuranceType) {
      this.addInsuranceEntry();
    }
  }
  get crmStatusOptions(): string[] {
    return Object.values(CRMStatus);
  }
  addInsuranceEntry() {
    if (!Array.isArray(this.newCompany.insuranceEntries)) {
      this.newCompany.insuranceEntries = [];
    }

    this.newCompany.insuranceEntries.push({
      companyInsuranceName: this.newCompany.companyInsuranceName || '',
      policyNumber: this.newCompany.policyNumber || '',
      policyStartDate: this.newCompany.policyStartDate || '',
      policyExpirationDate: this.newCompany.policyExpirationDate || '',
      insuranceuploadDocument: this.newCompany.insuranceuploadDocument || null
    });

    this.newCompany.companyInsuranceName = '';
    this.newCompany.policyNumber = '';
    this.newCompany.policyStartDate = '';
    this.newCompany.policyExpirationDate = '';
    this.newCompany.insuranceuploadDocument = null;

    this.cdr.detectChanges(); // Ensure UI updates
  }

  removeInsuranceEntry(index: number) {
    if (this.newCompany.insuranceEntries.length > index) {
      this.newCompany.insuranceEntries.splice(index, 1);
      console.log('Insurance Entry Removed:', this.newCompany.insuranceEntries);
      this.cdr.detectChanges();
    }
  }

  onFileChange(event: any, index: number | string, type?: string) {
    const file = event.target.files[0];
    if (!file) return;

    const numericIndex = typeof index === 'string' ? parseInt(index, 10) : index as number;

    if (type === 'insurance') {
      if (!Array.isArray(this.newCompany.insuranceEntries)) {
        this.newCompany.insuranceEntries = [];
      }
      if (!this.newCompany.insuranceEntries[numericIndex]) {
        this.newCompany.insuranceEntries[numericIndex] = {};
      }
      this.newCompany.insuranceEntries[numericIndex].insuranceuploadDocument = file;
      this.insuranceFileNames[numericIndex] = file.name; // Store file name

    } else if (type === 'compliance') {
      if (!this.newCompany.complianceDocuments) {
        this.newCompany.complianceDocuments = {};
      }
      this.newCompany.complianceDocuments[index] = file;
      this.complianceFilesNames[index as keyof typeof this.complianceFilesNames] = file.name; // Store file name

      console.log('✅ Compliance file stored:', index, file);

    } else if (typeof index === 'string') {
      this.newCompany[index] = file;
      this.generalFileNames = this.generalFileNames || {}; // Ensure it's initialized
      this.generalFileNames[index] = file.name; // Store file name for general case
    }

    console.log('✅ Updated newCompany:', this.newCompany);
    this.cdr.detectChanges();
  }


  submitForm(form: NgForm) {
    if (form.invalid) {
      form.form.markAllAsTouched();
      this.toastr.error('Please correct the highlighted fields before submitting.', 'Form Submission Error');
      return;
    }
    console.log('Form data before submit:', this.newCompany); // <-- Add this line

    const formData = new FormData();

    Object.keys(this.newCompany).forEach(key => {
      if (['insuranceEntries', 'accountsPermits', 'complianceDocuments'].includes(key)) return;
      if (this.newCompany[key] !== undefined && this.newCompany[key] !== null) {
        formData.append(key, this.newCompany[key]);
      }
    });

    try {
      // ✅ Ensure accountsPermits Exists
      if (!this.newCompany.accountsPermits) {
        this.toastr.error('Accounts Permits information is missing!');
        console.error('❌ Missing accountsPermits:', this.newCompany);
        return;
      }
      formData.append('accountsPermits', JSON.stringify(this.newCompany.accountsPermits));

      // ✅ Process Insurance Documents
      if (this.newCompany.insuranceEntries && this.newCompany.insuranceEntries.length > 0) {
        // Validate insurance entries
        for (const [index, entry] of this.newCompany.insuranceEntries.entries()) {
          if (!entry.companyInsuranceName) {
            this.toastr.error(`Insurance document at index ${index} is missing companyInsuranceName`);
            return;
          }
        }

        // Stringify metadata (excluding files)
        const insuranceMetadata = this.newCompany.insuranceEntries.map((entry: InsuranceEntry) => ({
          insuranceType: entry.insuranceType,
          companyInsuranceName: entry.companyInsuranceName,
          policyNumber: entry.policyNumber,
          policyStartDate: entry.policyStartDate,
          policyExpirationDate: entry.policyExpirationDate
        }));
        formData.append('insuranceDocuments', JSON.stringify(insuranceMetadata));

        // Append each file with correct key (insuranceuploadDocument_0, etc.)
        this.newCompany.insuranceEntries.forEach((entry: InsuranceEntry, index: number) => {
          if (entry.insuranceuploadDocument) {
            formData.append(`insuranceuploadDocument_${index}`, entry.insuranceuploadDocument);
          }
        });
      }

      // ✅ Process Compliance Documents
      if (this.newCompany.complianceDocuments && Object.keys(this.newCompany.complianceDocuments).length > 0) {
        // Convert complianceDocuments object to array and stringify metadata
        const complianceEntries = Object.entries(this.newCompany.complianceDocuments).map(([key, value]) => ({
          complianceType: key,
          documentName: key,
          complianceuploadDocument: value as File | null | undefined
        }));
        const complianceMetadata = complianceEntries.map((doc, index) => ({
          complianceType: doc.complianceType || 'General',
          documentName: doc.documentName || `Compliance Document ${index + 1}`
        }));
        formData.append('complianceEntities', JSON.stringify(complianceMetadata));

        // Append each file with correct key (complianceuploadDocument_0, etc.)
        complianceEntries.forEach((doc: ComplianceDocument, index: number) => {
          if (doc.complianceuploadDocument) {
            formData.append(`complianceuploadDocument_${index}`, doc.complianceuploadDocument);
          }
        });
      }

      console.log('✅ Final FormData:', formData);

    } catch (error) {
      console.error('❌ Document processing error:', error);
      this.toastr.error('Failed to process document attachments');
      return;
    }

    // ✅ Send API request
    this.serviceAuthService.createCompany(formData).subscribe({
      next: (response) => {
        console.log('✅ API Response:', response);
        this.toastr.success('Company created successfully!');
        this.resetForm(form);
      },
      error: (error) => {
        console.error('❌ Creation error:', error);
        this.toastr.error(error.message || 'Error creating company');
      }
    });
  }

  resetForm(form: NgForm) {
    form.resetForm();
    this.newCompany = { insuranceEntries: [], complianceDocuments: {}, accountsPermits: {} };
    this.insuranceFileNames = {};
    this.complianceFilesNames = {};
  }



  // ✅ Updated processDocumentArray function
  private processDocumentArray(
    entries: any[],
    fileKeys: string | string[],
    arrayName: string,
    formData: FormData
  ): any[] {
    if (!entries || entries.length === 0) {
      formData.delete(arrayName); // Remove empty array
      return [];
    }

    const processed = [];
    const keys = Array.isArray(fileKeys) ? fileKeys : [fileKeys];

    for (const [index, entry] of entries.entries()) {
      if (!entry || Object.keys(entry).length === 0) continue; // Skip empty entries

      const docEntry = { ...entry };

      for (const key of keys) {
        if (entry[key] instanceof File) {
          const uniqueKey = ` ${key}_${index}`; // Matches backend expectation
          formData.append(uniqueKey, entry[key]); // ✅ Now formData is properly used
          docEntry[key] = uniqueKey; // Store reference key
        }
      }

      processed.push(docEntry);
    }

    return processed;
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  goToSection(section: string, event: Event) {
    event.stopPropagation();
    this.activeSection = section;
  }
  loadCompanyId(): void {
    this.companyId = localStorage.getItem('companyId');
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;

    // Reset form visibility for users tab
    if (tabName === 'users') {
      this.showAddUserForm = false;
    }

    // Show or hide Add button based on tab
    if (tabName === 'tasks' || tabName === 'c-contact') {
      this.showAddButton = true;
    } else {
      this.showAddButton = false;
    }
  }
  showAddButton: boolean = false;
  // loadCompany() {
  //   this.serviceAuthService.getAllCompanies().subscribe((data: any) => {
  //     this.companies = data;
  //     this.cdr.detectChanges();
  //     this.toastr.success('Companies loaded successfully!');
  //   }, error => {
  //     console.error('Error loading companies:', error);
  //     this.toastr.error('Failed to load companies.');
  //   });
  // }

  loadCompany() {
    this.serviceAuthService.getAllCompanies().subscribe((data: any) => {
      this.companies = data;
      this.filteredCompanies = data; // Initialize filteredCompanies with all companies
      this.calculateTotalPages(); // Recalculate total pages after loading
      this.updatePaginatedCompanies(); // Update paginated companies after loading
      console.log('Loaded Companies:', this.companies);
      this.cdr.detectChanges();
      this.toastr.success('Companies loaded successfully!');
    }, error => {
      console.error('Error loading companies:', error);
      this.toastr.error('Failed to load companies.');
    });
  }
  viewCompanyDetails(company: any) {
    this.selectedCompany = company;
  }
  editCompany(company: any) {
    // Populate form for editing
    this.selectedCompany = company;
  }




  loadUsers() {
    this.serviceAuthService.getUsersFromAPI().subscribe((data: any) => {
      this.users = data;
      this.cdr.detectChanges();
    }, (error: any) => {
      console.error('Error loading users:', error);
      this.toastr.error('Failed to load users.');
    });
  }

  resetNewUser() {
    this.newUser = {
      name: '',
      email: '',
      role: '',
      companyId: '',
      password: '',
      permissions: {
        truckList: {
          create: false,
          read: false,
          update: false,
          delete: false
        },
        trailerList: {
          create: false,
          read: false,
          update: false,
          delete: false
        },
        driverList: {
          create: false,
          read: false,
          update: false,
          delete: false
        },
        driverApplication: {
          create: false,
          read: false,
          update: false,
          delete: false
        },
        companyList: {
          create: false,
          read: false,
          update: false,
          delete: false
        }
      }
    };
  }



  editUser(user: any) {
    console.log('Editing user:', user);
    // Populate the newUser object for editing if needed
  }

  deleteUser(user: any) {
    this.serviceAuthService.deleteUser(user._id).subscribe(() => {
      this.toastr.success('User deleted successfully!');
      this.loadUsers();
    }, (error: any) => {
      console.error('Error deleting user:', error);
      this.toastr.error('Error deleting user.');
    });
  }


  onDotChange(dot: string) {
    // Prevent the DOT field from accepting a dot character
    if (dot.includes('.')) {
      this.newCompany.dot = dot.replace(/\./g, '');
      return;
    }

    if (dot) {
      clearTimeout(this.dotTimeout);

      this.dotTimeout = setTimeout(() => {
        this.createDotCompany({ dot });
      }, 5000); // 5 seconds delay
    }
  }

  // Create DOT company and auto-populate fields from API response
  createDotCompany(companyData: any) {
    const token = this.serviceAuthService.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', ` Bearer ${token}`);
    this.serviceAuthService.createDotCompany(companyData).subscribe((response: any) => {
      // console.log('DOT company created successfully:', response);

      if (
        response &&
        response.dot &&
        response.dot.data &&
        response.dot.data.dotData &&
        response.dot.data.mcData &&
        response.dot.data.mcData.record
      ) {
        const carrier = response.dot.data.dotData.record.content.carrier;
        const mcNumbers = response.dot.data.mcData.record.content[0];

        // Check if the carrier data exists
        if (carrier) {
          this.populateCompanyFields(carrier);
          this.populateMcNumbers(mcNumbers);
          this.toastr.success('DOT company created and fields populated successfully!');
        } else {
          this.toastr.error('Carrier data is not available in the response.');
        }
      } else {
        this.toastr.error('Invalid response structure from the DOT API.');
      }
    }, (error: any) => {
      console.error('Error creating DOT company:', error);
      this.toastr.error('Error creating DOT company.');
    });
  }
  // Populate form fields with carrier data from DOT API response
  populateCompanyFields(carrier: any) {
    if (carrier) {
      this.newCompany.legalName = carrier.legalName || '';
      this.newCompany.dotNumber = carrier.dotNumber || '';
      this.newCompany.ein = carrier.ein || '';
      this.newCompany.phyStreet = carrier.phyStreet || '';
      this.newCompany.phyCountry = carrier.phyCountry || '';
      this.newCompany.phyCity = carrier.phyCity || '';
      this.newCompany.phyState = carrier.phyState || '';
      this.newCompany.phyZipcode = carrier.phyZipcode || '';
      this.newCompany.Allowtooperator = carrier.allowedToOperate || '';
      this.newCompany.BiptoInsurance = carrier.bipdInsuranceRequired || '';
      this.newCompany.CompanyDBA = carrier.dbaName || 'N/A';
      this.newCompany.Broker = carrier.brokerAuthorityStatus || 'N';
      this.newCompany.Common = carrier.commonAuthorityStatus || 'N';
      this.newCompany.Contract = carrier.contractAuthorityStatus || 'N';
      this.newCompany.DotStatus = carrier.statusCode || 'N';
      this.newCompany.Vehicle = carrier.vehicleOosRateNationalAverage || 'N';
      this.newCompany.Driver = carrier.driverOosRateNationalAverage || 'N';
      this.newCompany.Hazmat = carrier.hazmatOosRateNationalAverage || 'N';
      this.newCompany.companyName = this.newCompany.legalName;
      this.cdr.detectChanges();
    } else {
      this.toastr.error('Carrier data is not available.');
    }
  }
  populateMcNumbers(mcNumbers: any) {
    console.log('MC Numbers:', mcNumbers);

    if (mcNumbers) {
      this.newCompany.mc = mcNumbers.docketNumber || '';
      this.cdr.detectChanges();
    } else {
      this.toastr.error('No MC numbers available in the response.');
    }
  }



  getCompanyById(id: string) {
    this.serviceAuthService.getCompanyById(id).subscribe((data: any) => {
      this.selectedCompany = data;
      this.toastr.success('Company details loaded!');
    }, error => {
      console.error('Error loading company by ID:', error);
      this.toastr.error('Failed to load company details.');
    });
  }



  searchCompany() {
    console.log('Search Query:', this.searchQuery);
    this.filteredCompanies = this.companies.filter(company =>
      company.dot.includes(this.searchQuery) ||
      company.companyName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      (company.mc && company.mc.includes(this.searchQuery))
    );
    this.calculateTotalPages(); // Recalculate total pages after searching
    this.updatePaginatedCompanies(); // Update paginated companies after searching

    console.log('Filtered Companies:', this.filteredCompanies);
    this.cdr.detectChanges(); // Ensure UI updates
  }
  isHighlighted(company: any): boolean {
    return this.highlightedCompany && this.highlightedCompany._id === company._id;
  }



  calculateTotalPages() {
    const totalItems = this.filteredCompanies.length;
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
    this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePaginatedCompanies();
  }

  updatePaginatedCompanies() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCompanies = this.filteredCompanies.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getTotalPages(): number {
    return this.totalPages;
  }

  // Removed duplicate editCompany method to fix compile error.


  setupOffcanvasClose() {
    this.sharedUtilityService.setupOffcanvasClose(this.renderer);
  }

  searchDot() {
    if (!this.newCompany?.dot) {
      console.warn("DOT number is empty.");
      return;
    }

    console.log("Searching for DOT:", this.newCompany.dot);
    this.isLoading = true;

    // Simulate API call (2 seconds delay)
    setTimeout(() => {
      console.log("DOT data received:", this.newCompany.dot);
      this.isLoading = false; // stop loader
    }, 6500);
  }
  get filteredCrmList() {
    if (!this.selectedCarrierId) return this.crmList;
    return this.crmList.filter(crm => crm._id === this.selectedCarrierId);
  }




  editCrm(crm: any) {
    this.editingCrm = crm; // keep reference, do not deep copy

    // Parse stringified fields if needed
    let accountsPermits = crm.accountsPermits;
    if (typeof accountsPermits === 'string') {
      try { accountsPermits = JSON.parse(accountsPermits); } catch { accountsPermits = {}; }
    }

    let insuranceEntries = crm.insuranceEntries;
    if (typeof insuranceEntries === 'string') {
      try { insuranceEntries = JSON.parse(insuranceEntries); } catch { insuranceEntries = []; }
    }

    let insuranceDocuments = crm.insuranceDocuments;
    if (typeof insuranceDocuments === 'string') {
      try { insuranceDocuments = JSON.parse(insuranceDocuments); } catch { insuranceDocuments = []; }
    }

    let complianceDocuments = crm.complianceDocuments;
    if (typeof complianceDocuments === 'string') {
      try { complianceDocuments = JSON.parse(complianceDocuments); } catch { complianceDocuments = []; }
    }

    // Deep copy for entries, preserving nested objects/arrays
    this.entries = {
      ...crm,
      services: crm.services ? [...crm.services] : [],
      insuranceEntries,
      accountsPermits,
      insuranceDocuments,
      complianceDocuments,
    };

    this.activeSection = 'company-info';
  }
  // Update CRM

  onServiceToggle(serviceLabel: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (!this.entries.services) {
      this.entries.services = [];
    }
    if (checked) {
      if (!this.entries.services.includes(serviceLabel)) {
        this.entries.services.push(serviceLabel);
      }
    } else {
      this.entries.services = this.entries.services.filter((s: string) => s !== serviceLabel);
    }
  }
  resetEntries() {
    this.entries = {
      // Company Info
      carrierName: '',
      contact: '',
      status: '',
      services: [],
      lastContact: '',
      createdBy: '',
      mcNumber: '',
      name: '',
      title: '',
      phone: '',
      email: '',
      dot: '',
      companyName: '',
      ein: '',
      mc: '',
      phyStreet: '',
      phyCity: '',
      phyZipcode: '',
      phyState: '',
      phoneNumber: '',
      companyEmail: '',
      caNumber: '',
      CompanyDBA: '',
      corporation: '',
      companyType: '',
      iftaAcc: '',
      prepass: '',
      irpAcc: '',
      irpRenewalDate: '',
      operatingAuthority: '',
      // Insurance Info
      insuranceBrokerName: '',
      companyPhysicalAddress: '',
      companyMailingAddress: '',
      companyEmailAddress: '',
      Contact: '',
      insuranceType: '',
      insuranceEntries: [],
      // Compliance Info
      accountsPermits: {
        prepassAccountNumber: '',
        iftaAccountNumber: '',
        ucrNumber: ''
      },
      complianceDocuments: {},
      kyu: '',
      kyuUploadDocument: null,
      kyuExpiration: '',
      ny: '',
      nyUploadDocument: null,
      nyExpiration: '',
      w9UploadDocument: null,
      irpRenewal: '',
      usDOTRegistrationUploadDocument: null,
      mcCertificateUploadDocument: null,
      iftaRegistrationUploadDocument: null,
      insuranceDocument: null,
      // Accounts & Permits
      prepassAccountNumber: '',
      iftaAccountNumber: '',
      ucrNumber: '',
      // Documentation
      legalName: '',
      // Add any other fields needed for edit modal here
    };
  }

  onServiceChange(event: Event, service: string): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.entries.services.includes(service)) {
        this.entries.services.push(service);
      }
    } else {
      this.entries.services = this.entries.services.filter((s: string) => s !== service);
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'prospect':
        return 'badge bg-warning text-dark';
      case 'new':
        return 'badge bg-info';
      case 'client':
        return 'badge bg-success';
      default:
        return 'badge bg-secondary'; // fallback
    }
  }

  addInsuranceEntryToEdit() {
    if (!Array.isArray(this.entries.insuranceEntries)) {
      this.entries.insuranceEntries = [];
    }
    this.entries.insuranceEntries.push({
      companyInsuranceName: '',
      policyNumber: '',
      policyStartDate: '',
      policyExpirationDate: '',
      insuranceuploadDocument: null
    });
  }


  updateCompanyProfile(form: NgForm) {
    console.log('updateCompanyProfile called');
    console.log('Form valid?', form.valid);
    console.log('Form values:', this.entries);

    if (!this.editingCrm || !this.editingCrm._id) {
      console.log('No CRM selected for update.');
      this.toastr.error('No CRM selected for update.');
      return;
    }
    if (!form.valid) {
      console.log('Form is invalid, aborting update.');
      this.toastr.error('Form is invalid. Please fill all required fields.');
      return;
    }

    const payload: any = { ...this.entries };

    // Always ensure services is an array
    if (!Array.isArray(payload.services)) {
      payload.services = payload.services ? [payload.services] : [];
    }

    // Parse stringified fields if needed
    if (typeof payload.accountsPermits === 'string') {
      try { payload.accountsPermits = JSON.parse(payload.accountsPermits); } catch { }
    }
    if (typeof payload.complianceDocuments === 'string') {
      try { payload.complianceDocuments = JSON.parse(payload.complianceDocuments); } catch { }
    }
    if (typeof payload.insuranceDocuments === 'string') {
      try { payload.insuranceDocuments = JSON.parse(payload.insuranceDocuments); } catch { }
    }

    // Stringify before sending (backend expects stringified JSON)
    if (payload.accountsPermits && typeof payload.accountsPermits !== 'string') {
      payload.accountsPermits = JSON.stringify(payload.accountsPermits);
    }
    if (payload.complianceDocuments && typeof payload.complianceDocuments !== 'string') {
      payload.complianceDocuments = JSON.stringify(payload.complianceDocuments);
    }
    if (payload.insuranceDocuments && typeof payload.insuranceDocuments !== 'string') {
      payload.insuranceDocuments = JSON.stringify(payload.insuranceDocuments);
    }

    // Final log before sending
    console.log('Updating CRM with payload:', payload);

    this.serviceAuthService.updateCompanyProfile(this.editingCrm._id, payload).subscribe({
      next: (res: any) => {
        this.toastr.success('CRM updated successfully!');
        form.resetForm();
        this.editingCrm = null;
        this.loadCompany(); // Refresh CRM/company data

        // Close the edit modal/offcanvas if open
        // const offcanvasEl = document.getElementById('edit-profile') || document.getElementById('profile-offcanvas');
        // if (offcanvasEl) {
        //   const offcanvas = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvasEl);
        //   if (offcanvas) offcanvas.hide();
        // }

        // Clean up any modal/offcanvas backdrops
        setTimeout(() => {
          document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach(el => el.remove());
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
        }, 200);
      },
      error: (err: any) => {
        this.toastr.error(err?.message || 'Failed to update CRM.');
      }
    });
  } isolateModal(modalId: string): void {
    const modal = document.getElementById(modalId);

    if (modal) {
      modal.addEventListener('mousedown', (e) => e.stopImmediatePropagation());
      modal.addEventListener('click', (e) => e.stopImmediatePropagation());
      modal.addEventListener('focusin', (e) => e.stopImmediatePropagation());
    }

    const modalDialog = document.querySelector(`#${modalId} .modal-dialog`);
    if (modalDialog) {
      modalDialog.addEventListener('mousedown', (e) => e.stopImmediatePropagation());
      modalDialog.addEventListener('click', (e) => e.stopImmediatePropagation());
    }
  }

  get activeProspectsCount(): number {
    return this.crmList.filter(crm =>
      crm.status?.toLowerCase().includes('prospect')
    ).length;
  }
  get activeProspectsThisMonth(): number {
    return this.crmList.filter(crm => {
      const date = new Date(crm.lastContact);
      const now = new Date();
      return crm.status?.toLowerCase().includes('prospect') &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    }).length;
  }

  get activeProspectsLastMonth(): number {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return this.crmList.filter(crm => {
      const date = new Date(crm.lastContact);
      return crm.status?.toLowerCase().includes('prospect') &&
        date.getMonth() === lastMonth.getMonth() &&
        date.getFullYear() === lastMonth.getFullYear();
    }).length;
  }

  get percentageChange(): number {
    const current = this.activeProspectsThisMonth;
    const last = this.activeProspectsLastMonth;
    if (last === 0) return 100; // Avoid divide by 0
    return ((current - last) / last) * 100;
  }
  get totalCarriersThisMonth(): number {
    const now = new Date();
    return this.crmList.filter(crm => {
      const date = new Date(crm.lastContact);
      return date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear();
    }).length;
  }

  get totalCarriersLastMonth(): number {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return this.crmList.filter(crm => {
      const date = new Date(crm.lastContact);
      return date.getMonth() === lastMonth.getMonth() &&
        date.getFullYear() === lastMonth.getFullYear();
    }).length;
  }

  get carrierPercentageChange(): number {
    const current = this.totalCarriersThisMonth;
    const last = this.totalCarriersLastMonth;
    if (last === 0) return 100; // avoid division by 0
    return ((current - last) / last) * 100;
  }



  ngAfterViewInit(): void {
    this.isolateModal('taskModal1');
    this.isolateModal('taskModal2');

    // ✅ Modal close hone par backdrop cleanup
    const modal1 = document.getElementById('taskModal1');
    if (modal1) {
      modal1.addEventListener('hidden.bs.modal', () => {
        this.cleanupBackdrops();
      });
    }

    const modal2 = document.getElementById('taskModal2');
    if (modal2) {
      modal2.addEventListener('hidden.bs.modal', () => {
        this.cleanupBackdrops();
      });
    }

    // ✅ Offcanvas backdrop cleanup
    const offcanvasEl = document.getElementById('profile-offcanvas');
    if (offcanvasEl) {
      offcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
        this.cleanupBackdrops();
      });

      // backdrop par click hua to confirm modal dikhao
      offcanvasEl.addEventListener('click', (event: any) => {
        if (event.target.id === 'profile-offcanvas') {
          this.openConfirmModal();
        }
      });
    }
  }

  get activeTasksSorted() {
    return this.activeTasks.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  get completedTasksSorted() {
    return this.completedTasks.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );
  }


  get activeTasks(): any[] {
    if (!this.selectedCrm) return [];
    const id = this.selectedCrm.companyId || this.selectedCrm._id;
    if (!id) return [];
    if (!Array.isArray(this.taskList)) return [];
    return this.taskList.filter(task =>
      (task.completed === false || task.completed === 'false') &&
      task.companyId === id
    );
  }

  get completedTasks(): any[] {
    if (!this.selectedCrm) return [];
    const id = this.selectedCrm.companyId || this.selectedCrm._id;
    if (!id) return [];
    if (!Array.isArray(this.taskList)) return [];
    return this.taskList.filter(task =>
      (task.completed === true || task.completed === 'true') &&
      task.companyId === id
    );
  }

  loadAllTasks() {
    this.serviceAuthService.getAllTask().subscribe({
      next: (res: any) => {
        this.taskList = Array.isArray(res) ? res : [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading tasks:', err);
      }
    });
  }

  updateTask(form: NgForm) {
    if (!form.valid) {
      this.toastr.warning('Please fill out all required fields.');
      return;
    }
    // Ensure companyId is set for update
    this.taskEntries.companyId = this.selectedCrm?.companyId || this.selectedCrm?._id;
    this.serviceAuthService.updateTask(this.editingTask._id, this.taskEntries).subscribe({
      next: () => {
        this.toastr.success('Task updated successfully!');
        form.resetForm();
        this.editingTask = null;
        this.loadAllTasks();
        this.closeTaskModal();
      },
      error: () => {
        this.toastr.error('Failed to update task.');
      },
    });
  }

  deleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    this.serviceAuthService.deleteTask(taskId).subscribe({
      next: () => {
        this.toastr.success('Task deleted successfully!');
        this.loadAllTasks();
      },
      error: () => {
        this.toastr.error('Failed to delete task.');
      },
    });
  }

  closeTaskModal() {
    const modalEl = document.getElementById('taskModal2');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }
  }


  markTaskCompleted(task: any) {
    task.completed = true;
    this.toastr.success('Task marked as completed!');
    // Optional: Update backend
    // this.serviceAuthService.updateTask(task._id, { completed: true }).subscribe();
  }

  getDueLabel(dueDateStr: Date | string): string {
    const today = new Date();
    const dueDate = new Date(dueDateStr);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    return `Due on ${formatDate(dueDate, 'MMM d, y', 'en')}`;
  }

  getDueClass(dueDateStr: Date | string): string {
    const today = new Date();
    const dueDate = new Date(dueDateStr);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 3600 * 24));

    if (diffDays < 0) return 'text-danger';
    if (diffDays === 0) return 'text-danger';
    if (diffDays <= 3) return 'text-warning';
    return 'text-muted';
  }

  openTaskModal(task: any) {
    this.selectedTask = task;

    const modalEl = this.elRef.nativeElement.querySelector('#taskModal1');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
openTaskDetails(task: any) {
  this.selectedTask = task;
    const modalEl =  this.elRef.nativeElement.querySelector('#taskDetailsModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  
}

  closeCompletedTaskModal() {
    const modalEl = document.getElementById('taskModal1');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    }
  }
  selectedTab: 'active' | 'completed' = 'active';

  resetProfileForm() {
    this.newCompany = {}; // or set to your default empty structure
    this.generalFileNames = {};
    this.insuranceFileNames = [];
    this.complianceFilesNames = {};
  }




  openConfirmModal() {
    const modalEl = document.getElementById('confirmCloseModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  closeAndResetForm(form: any) {
    if (form) form.resetForm();
    this.newCompany = { dot: '', companyName: '' };

    // hide modal
    const modalEl = document.getElementById('confirmCloseModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }

    // hide offcanvas
    const offcanvasEl = document.getElementById('profile-offcanvas');
    if (offcanvasEl) {
      const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasEl);
      offcanvas?.hide();
    }

    // extra cleanup
    this.cleanupBackdrops();
  }

  private cleanupBackdrops() {
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop')
        .forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }, 200);
  }
  getButtonLabel(): string {
    switch (this.activeTab) {
      case 'activity': return 'Activity';
      case 'tasks': return 'Task';
      case 'services': return 'Service';
      case 'notes': return 'Note';
      case 'c-profile': return 'Carrier Profile';
      case 'c-contact': return 'Carrier Contact';
      default: return 'Item';
    }
  }
  getModalTarget(): string {
    switch (this.activeTab) {
      case 'activity': return '#activityModal';
      case 'tasks': return '#taskModal2';
      case 'services': return '#serviceModal';
      case 'notes': return '#noteModal';
      case 'c-profile': return '#profileModal';
      case 'c-contact': return '#contactModal';
      default: return '#defaultModal';
    }
  }
  getInputPlaceholder(): string {
    return `Enter ${this.getButtonLabel()} Title`;
  }
  // Submit function



  // Call this when the tab changes
  onActivityTypeChange(type: string) {
    this.selectedActivityType = type;
  }

  logActivity() {
    if (!this.selectedCrm || !this.selectedCrm._id) {
      this.toastr.error('No company selected.');
      return;
    }
    // if (!this.activityForm.details || !this.activityForm.outcome) {
    //   this.toastr.warning('Please fill all fields.');
    //   return;
    // }

    const payload = {
      companyId: this.selectedCrm._id,
      type: this.selectedActivityType,
      details: this.activityForm.details,
      outcome: this.activityForm.outcome,
      createdAt: new Date(),
      createdBy: this.currentUser?._id,
      createdByName: this.currentUser?.name || 'Unknown User'
    };

    this.isLoadingActivity = true;
    this.serviceAuthService.createActivity(payload).subscribe({
      next: () => {
        this.toastr.success('Activity logged!');
        this.activityForm.details = '';
        this.activityForm.outcome = '';
        this.loadActivityLogs();
        this.isLoadingActivity = false;
      },
      error: () => {
        this.toastr.error('Failed to log activity.');
        this.isLoadingActivity = false;
      }
    });
  }


  // Fetch activities for the selected company
  loadActivityLogs() {
    if (!this.selectedCrm || !this.selectedCrm._id) return;
    this.isLoadingActivity = true;
    this.serviceAuthService.getAllActivity().subscribe(
      (logs: any) => {
        // Filter by companyId
        this.activityLogs = Array.isArray(logs) ? logs.filter(log => log.companyId === this.selectedCrm._id) : [];
        this.isLoadingActivity = false;
      },
      () => {
        this.activityLogs = [];
        this.isLoadingActivity = false;
      }
    );
  }
  loadUsersForCompany() {
    this.serviceAuthService.getUsersFromAPI().subscribe((response: any) => {
      const allUsers = Array.isArray(response.data) ? response.data : response;
      this.filteredSuperAdminUsers = allUsers.filter((user: any) =>
        user.role === 'superadminuser' ||
        (this.selectedCrm && user.companyId === this.selectedCrm._id)
      );
      this.superAdminUsers = allUsers;
      this.cdr.detectChanges();
    });
  }


  // Task CRUD and filtering
  submitTask(form: NgForm) {
    if (!form.valid) {
      this.toastr.warning('Please fill out all required fields.');
      return;
    }

    this.taskEntries.companyId = this.selectedCrm.companyId || this.selectedCrm._id;
    if (!this.taskEntries.companyId) {
      this.toastr.error('No company selected. Please open a company profile before adding a task.');
      return;
    }

    // ✅ Add creator & creation date
    this.taskEntries.createdBy = this.currentUser?.name || 'Unknown User';
    this.taskEntries.createdAt = new Date();

    // ✅ If task assigned, keep name instead of just ID
    if (this.taskEntries.assignedTo) {
      const assignedUser = this.filteredSuperAdminUsers.find(u => u._id === this.taskEntries.assignedTo);
      this.taskEntries.assignedTo = assignedUser ? assignedUser.name : this.taskEntries.assignedTo;
    }

    // ✅ Modal programmatically close
    const modalEl = document.getElementById('taskModal2');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }, 300);

    this.serviceAuthService.createTask(this.taskEntries).subscribe({
      next: (res) => {
        this.toastr.success('Task added successfully!');
        form.resetForm();
        this.loadAllTasks();
        this.closeTaskModal();
      },
      error: () => {
        this.toastr.error('Failed to add task.');
      },
    });
  }

  // ✅ When completing, also set completedBy & completedAt
  toggleTaskCompletion(task: any) {
    const currentStatus = typeof task.completed === 'string'
      ? task.completed === 'true'
      : task.completed;
    const isCompleted = !currentStatus;

    this.serviceAuthService.updateTask(task._id, {
      completed: isCompleted,
      completedAt: isCompleted ? new Date() : null,
      completedBy: isCompleted ? (this.currentUser?.name || 'Unknown User') : null // ✅
    }).subscribe({
      next: () => {
        this.loadAllTasks();
        this.toastr.success(isCompleted ? 'Task completed!' : 'Task reactivated!');
      },
      error: () => {
        this.toastr.error('Update failed. Please try again.');
      }
    });
  }

  submitCompletedTask(form: NgForm) {
    if (!form.valid || !this.selectedTask) {
      this.toastr.warning('Please fill out all required fields.');
      return;
    }

    // ✅ Mark as completed and store completedBy
    this.selectedTask.completed = true;
    this.selectedTask.completedAt = new Date();
    this.selectedTask.completedBy = this.currentUser?.name || 'Unknown User';

    this.serviceAuthService.updateTask(this.selectedTask._id, this.selectedTask).subscribe({
      next: () => {
        this.toastr.success('Task marked as completed!');
        this.loadAllTasks();
        this.closeCompletedTaskModal();

        if (this.selectedTask.followupCreated && this.selectedTask.followupTask) {
          const followup = {
            title: this.selectedTask.followupTask,
            dueDate: this.selectedTask.followupDueDate,
            priority: this.selectedTask.followupPriority || 'normal',
            relatedTo: this.selectedTask.relatedTo,
            assignedTo: this.selectedTask.assignedTo,
            description: 'Follow-up for: ' + this.selectedTask.title,
            createdBy: this.currentUser?.name || 'Unknown User',
            createdAt: new Date(),
            companyId: this.selectedCrm.companyId || this.selectedCrm._id
          };
          this.serviceAuthService.createTask(followup).subscribe(() => {
            this.toastr.success('Follow-up task created!');
            this.loadAllTasks();
          });
        }
      },
      error: () => {
        this.toastr.error('Failed to complete task.');
      }
    });
  }
  loadCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);

        this.currentUser = {
          _id: parsedUser._id || '',
          name: parsedUser.name || 'Unknown User',
          role: parsedUser.role || '',
          email: parsedUser.email || '',
          companyId: parsedUser.companyId || null
        };
      } else {
        this.currentUser = {
          _id: '',
          name: 'Unknown User',
          role: '',
          email: '',
          companyId: null
        };
      }
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      this.currentUser = {
        _id: '',
        name: 'Unknown User',
        role: '',
        email: '',
        companyId: null
      };
    }
  }

  // ✅ Submit Note
  submitNote(form: NgForm) {
    if (!form.valid) {
      this.toastr.warning('Please write a note before saving.');
      return;
    }

    // ✅ Attach companyId (from selected CRM)
    const noteEntry: any = {
      note: this.newNote,
      companyId: this.selectedCrm.companyId || this.selectedCrm._id,
      createdBy: this.currentUser?.name || 'Unknown User',
      createdAt: new Date()
    };

    if (!noteEntry.companyId) {
      this.toastr.error('No company selected. Please open a company profile before adding a note.');
      return;
    }

    // ✅ Close modal programmatically if you are using a modal for notes
    const modalEl = document.getElementById('notesModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }, 300);

    // ✅ Call service
    this.serviceAuthService.createNote(noteEntry).subscribe({
      next: (res: any) => {
        this.toastr.success('Note added successfully!');
        form.resetForm();
        this.newNote = '';
        this.loadAllNotes(); // <-- make sure you have this to reload notes
      },
      error: () => {
        this.toastr.error('Failed to add note.');
      }
    });
  }

  // ✅ Load All Notes (call on init & after add/delete/update)
  loadAllNotes() {
    if (!this.selectedCrm || (!this.selectedCrm._id && !this.selectedCrm.companyId)) return;  // ✅ Ensure CRM is selected
    this.isLoadingNotes = true;

    this.serviceAuthService.getAllNotes().subscribe(
      (notes: any) => {
        // ✅ Filter notes by both possible companyId values
        const id1 = this.selectedCrm._id;
        const id2 = this.selectedCrm.companyId;
        this.notes = Array.isArray(notes)
          ? notes.filter(note => note.companyId === id1 || note.companyId === id2)
          : [];
        this.isLoadingNotes = false;
      },
      () => {
        this.notes = [];
        this.isLoadingNotes = false;
        this.toastr.error('Failed to load notes.');
      }
    );
  }


  // ✅ Delete Note
  deleteNote(id: string) {
    if (!confirm('Are you sure you want to delete this note?')) return;

    this.serviceAuthService.deleteNotesss(id).subscribe({
      next: () => {
        this.toastr.success('Note deleted successfully!');
        this.loadAllNotes();
      },
      error: () => {
        this.toastr.error('Failed to delete note.');
      }
    });
  }

  // ✅ Edit Note (fetch note by ID and prefill textarea)
  editNote(id: string) {
    this.serviceAuthService.getNoteById(id).subscribe({
      next: (res: any) => {
        this.editingNoteId = id;
        this.newNote = res.note; // assuming API response has `note` field
      },
      error: () => {
        this.toastr.error('Failed to fetch note details.');
      }
    });
  }

  // ✅ Update Note
  updateNote(form: NgForm) {
    if (!form.valid || !this.editingNoteId) {
      this.toastr.warning('No note selected for update.');
      return;
    }

    const noteData = {
      note: this.newNote,
      updatedBy: this.currentUser?.name || 'Unknown User',
      updatedAt: new Date()
    };

    this.serviceAuthService.updateNote(this.editingNoteId, noteData).subscribe({
      next: () => {
        this.toastr.success('Note updated successfully!');
        form.resetForm();
        this.newNote = '';
        this.editingNoteId = null;
        this.loadAllNotes();
      },
      error: () => {
        this.toastr.error('Failed to update note.');
      }
    });
  }



  // ✅ Load All Contacts
  loadCarrierContacts() {
    this.serviceAuthService.getCarrierContact().subscribe({
      next: (res: any) => {
        this.carrierContacts = Array.isArray(res) ? res : [];
      },
      error: () => {
        this.toastr.error('Failed to load carrier contacts.');
      }
    });
  }

  // ✅ Add Contact
  addCarrierContact(form: NgForm) {
    if (!form.valid) {
      this.toastr.warning('Please fill required fields.');
      return;
    }

    // ✅ Attach companyId from selected CRM
    const contactEntry: any = {
      ...this.newContact,
      companyId: this.selectedCrm?.companyId || this.selectedCrm?._id,
      createdBy: this.currentUser?.name || 'Unknown User',
      createdAt: new Date()
    };

    if (!contactEntry.companyId) {
      this.toastr.error('No company selected. Please open a company profile before adding a contact.');
      return;
    }

    // ✅ Close modal programmatically
    const modalEl = document.getElementById('contactModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
    setTimeout(() => {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
    }, 300);

    // ✅ Call service
    this.serviceAuthService.createCarrierContact(contactEntry).subscribe({
      next: () => {
        this.toastr.success('Contact added successfully!');
        form.resetForm();
        this.newContact = {};
        this.loadCarrierContacts(); // reload after add
      },
      error: () => {
        this.toastr.error('Failed to add contact.');
      }
    });
  }


  // ✅ Edit Contact (prefill form)
  editContact(contact: any) {
    this.editingContactId = contact._id;
    this.newContact = { ...contact }; // clone so editing does not affect list
    const modalEl = document.getElementById('contactModal');
    if (modalEl) {
      const modalInstance = new bootstrap.Modal(modalEl);
      modalInstance.show();
    }
  }

  // ✅ Update Contact
  updateCarrierContact(form: NgForm) {
    if (!form.valid || !this.editingContactId) {
      this.toastr.warning('No contact selected for update.');
      return;
    }

    // ✅ Clone and clean data before sending
    const updatedContact: any = { ...this.newContact };

    // Remove _id to avoid duplicate key errors
    if (updatedContact._id) {
      delete updatedContact._id;
    }

    // Ensure companyId is attached
    updatedContact.companyId = this.selectedCrm?.companyId || this.selectedCrm?._id;

    // Optional: track updater
    updatedContact.updatedBy = this.currentUser?.name || 'Unknown User';
    updatedContact.updatedAt = new Date();

    this.serviceAuthService.updateCarrierContacts(this.editingContactId, updatedContact).subscribe({
      next: () => {
        this.toastr.success('Contact updated successfully!');
        form.resetForm();
        this.newContact = {};
        this.editingContactId = null;
        this.loadCarrierContacts();
        this.closeModal();
      },
      error: () => {
        this.toastr.error('Failed to update contact.');
      }
    });
  }


  // ✅ Delete Contact
  deleteCarrierContact(id: string) {
    if (!confirm('Are you sure you want to delete this contact?')) return;

    this.serviceAuthService.deleteCarrierContacts(id).subscribe({
      next: () => {
        this.toastr.success('Contact deleted successfully!');
        this.loadCarrierContacts();
      },
      error: () => {
        this.toastr.error('Failed to delete contact.');
      }
    });
  }

  // ✅ Reset form when modal closes
  cancelEdit() {
    this.newContact = {};
    this.editingContactId = null;
  }

  // ✅ Programmatically close modal
  private closeModal() {
    const modalEl = document.getElementById('contactModal');
    if (modalEl) {
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) {
        modalInstance.hide();
      }
    }
  }

  onContactFormSubmit(form: NgForm) {
    if (this.editingContactId) {
      this.updateCarrierContact(form);
    } else {
      this.addCarrierContact(form);
    }
  }
  get recentActivityLogs() {
    return Array.isArray(this.activityLogs) ? [...this.activityLogs].reverse() : [];
  }

  trackByLogId(index: number, log: any) {
    return log._id || index;
  }
updateCrmStatus(newStatus: string) {
  if (!this.selectedCrm) return;
  this.selectedCrm.status = newStatus;
  // Optionally, update on server:
  if (this.selectedCrm._id) {
    this.serviceAuthService.updateCompanyProfile(this.selectedCrm._id, { status: newStatus }).subscribe({
      next: () => {
        this.toastr.success('Status updated!');
      },
      error: () => {
        this.toastr.error('Failed to update status.');
      }
    });
  }
}


}

