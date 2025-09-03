import { Component, OnInit,Renderer2 } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import * as bootstrap from 'bootstrap';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { SharedUtilityService } from '../../shared/shared-utility.service';

// Define an interface for insurance entries
// Define an interface for insurance entries


// Define an interface for insurance entries
interface InsuranceEntry {
  insuranceType: string;
  companyInsuranceName: string;
  policyNumber: string;
  policyStartDate: string;
  policyExpirationDate: string;
  insuranceuploadDocument?: File | null;
}

// Define an interface for compliance documents
interface ComplianceDocument {
  complianceType?: string;
  documentName?: string;
  complianceuploadDocument?: File | null;
}

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

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
    }
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
  itemsPerPage: number = 10;
  paginatedCompanies: any[] = [];
  totalPages: number = 0;
  totalPagesArray: number[] = [];
 
 
 

  constructor(
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
    this.loadCompany();
    this.loadUsers();
    this.setupOffcanvasClose(); // Add this line
    this.route.params.subscribe(params => {
      const companyId = params['id'];
      if (companyId) {
        this.getCompanyById(companyId); 
      }
    });
  

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

    const formData = new FormData();

    // ✅ Add non-array fields
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
                const uniqueKey =` ${key}_${index}`; // Matches backend expectation
                formData.append(uniqueKey, entry[key]); // ✅ Now formData is properly used
                docEntry[key] = uniqueKey; // Store reference key
            }
        }

        processed.push(docEntry);
    }

    return processed;
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
    if (tabName === 'users') {
      this.showAddUserForm = false; // Reset form visibility when switching tabs
    }
  }

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

    const headers = new HttpHeaders().set('Authorization',` Bearer ${token}`);
    this.serviceAuthService.createDotCompany(companyData).subscribe((response: any) => {
      // console.log('DOT company created successfully:', response);

      if (
        response &&
        response.dot &&
        response.dot.data &&
        response.dot.data.dotData &&
        response.dot.data.dotData.record &&
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
 
editCompany(company: any) {
  console.log('Editing company:', company);
  // Populate the selectedCompany object for editing if needed
}


 setupOffcanvasClose() {
  this.sharedUtilityService.setupOffcanvasClose(this.renderer);
}

searchDot() {
  // Replace with actual search logic
  if (this.newCompany?.dot) {
    console.log("Searching for DOT:", this.newCompany.dot);
    // You can call your API or filter logic here
  } else {
    console.warn("DOT number is empty.");
  }
}


}
