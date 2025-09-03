import { Component, OnInit } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Renderer2 } from '@angular/core';
import { SharedUtilityService } from '../../shared/shared-utility.service';
 
@Component({
  selector: 'app-driver-list',
  templateUrl: './driver-list.component.html',
  styleUrls:[ './driver-list.component.css']
})
export class DriverListComponent implements OnInit {
  drivers: any[] = [];
  newDriver: any = {
    drivingExperiences: [{}],
    accidentRecords: [{}],
    trafficViolations: [{}],
    employmentHistory: [{
      companyName: '', contactNo: '', email: '', street: '', city: '', state: '', zipcode: '', positionHeld: '', startDate: '', endDate: '', reasonForLeaving: '', gapsExplanation: '', fmcsaSubject: '', dotSensitive: ''
    }],
    randomDrugTestCCFs: [{ number: '', date: '' }],
    randomDrugTestResults: [{ number: '', date: '' }],
    miscDocuments: [{ name: '', date: '' }],
    status: 'PENDING', // Default status
    companyId: ''      // Default companyId (should be set by user)
  };
  filteredDrivers : any[] = [];
  searchTerm: string = '';
  selectedDriver: any = null;
  driverIdToDelete: string | null = null;
  driverToEdit: any = {};
  companies: any[] = [];
  originaldriverData: any = {};
  activeSection: 'personal-info' | 'driving-info' | 'document-info' | 'employment-history' = 'personal-info';
  isSidebarOpen: boolean = false;
  selectedFiles: { [key: string]: File } = {};
  activeFilter: string = 'all';
  nonCompliantDrivers: number = 0;
  compliantDrivers: number = 0;
  expiringDrivers: number = 0;
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalDrivers: number = 0;
  previousAddresses: any[] = [ { street: '', city: '', state: '', zip: '', years: '', months: '' } ];
 
// Edit dropdown state controls for address fields
editDropdownOpen = false;
editMailingDropdownOpen = false;
editPreviousDropdownOpen = false;

// Edit hover state for dropdowns
editHovered: string | null = null;
editMailingHovered: string | null = null;
editPreviousHovered: string | null = null;

// Edit CDL dropdown state and hover
editCurrentCdlDropdownOpen = false;
editOldCdlDropdownOpen = false;
editCurrentCdlHovered: string | null = null;
editOldCdlHovered: string | null = null;

  
  constructor(
    private serviceAuthService: ServiceAuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private sharedUtilityService: SharedUtilityService,
    private renderer: Renderer2) { }
 
  ngOnInit(): void {
    this.loadDrivers();
    this.loadCompany();
    this.setupOffcanvasClose();
    // Ensure at least one row for each dynamic section
    if (!this.newDriver.randomDrugTestCCFs || this.newDriver.randomDrugTestCCFs.length === 0) {
      this.newDriver.randomDrugTestCCFs = [{ number: '', date: '' }];
    }
    if (!this.newDriver.randomDrugTestResults || this.newDriver.randomDrugTestResults.length === 0) {
      this.newDriver.randomDrugTestResults = [{ number: '', date: '' }];
    }
    if (!this.newDriver.miscDocuments || this.newDriver.miscDocuments.length === 0) {
      this.newDriver.miscDocuments = [{ name: '', date: '' }];
    }
  }
 
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
 
 goToSection(section: 'personal-info' | 'driving-info' | 'document-info' | 'employment-history', event: Event) {
  event.stopPropagation();
  this.activeSection = section;
  document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
}
 
  onSave() {
    this.toastr.success('Changes saved successfully!', 'Success');
  }
 
  onClose() {
    this.activeSection = 'personal-info';
  }
 
  loadCompany() {
    this.serviceAuthService.getAllCompanies().subscribe((data: any) => {
      this.companies = data;
      this.cdr.detectChanges();
    }, error => {
      console.error('Error loading companies:', error);
    });
  }
 
  findCompanyName(companyId: string | string[]): string {
    if (Array.isArray(companyId)) {
        companyId = companyId.length > 0 ? companyId[0] : '';
    }
    const company = this.companies.find(company => company._id === companyId);
    return company ? company.companyName : 'N/A';
  }
 
  loadDrivers() {
    this.serviceAuthService.getDriversFromAPI().subscribe((drivers: any) => {
      this.drivers = drivers;
      this.filteredDrivers = drivers;
      this.totalItems = this.filteredDrivers.length;
      this.totalDrivers = drivers.length; // Update total drivers count

      // Calculate the counts for each category
      this.compliantDrivers = drivers.filter((driver: { status: string; }) => driver.status === 'APPROVED').length;
      this.nonCompliantDrivers = drivers.filter((driver: { status: string; }) => driver.status === 'PENDING').length;
      this.expiringDrivers = drivers.filter((driver: { status: string; }) => driver.status === 'EXPIRING').length;

      this.cdr.detectChanges();
    }, error => {
      console.error(error);
      this.toastr.error('Failed to load drivers.', 'Error');
    });
  }
 
  filterDrivers(filterType: string) {
    this.activeFilter = filterType; // Update the active filter

    if (filterType === 'all') {
      this.filteredDrivers = this.drivers;
    } else if (filterType === 'nonCompliant') {
      this.filteredDrivers = this.drivers.filter(driver => driver.status === 'PENDING');
    } else if (filterType === 'compliant') {
      this.filteredDrivers = this.drivers.filter(driver => driver.status === 'APPROVED');
    } else if (filterType === 'expiring') {
      this.filteredDrivers = this.drivers.filter(driver => driver.status === 'EXPIRING');
    }
    this.cdr.detectChanges();
  }


 
  onFileChange(event: Event, key: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // File size validation (10 MB = 10485760 bytes)
      if (file.size > 10485760) {
        this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
        input.value = '';
        return;
      }
      this.selectedFiles[key] = file; // Store selected file
    }
  }
 
  getFileName(key: string): string {
    return this.selectedFiles[key]?.name || '';
  }

  addRandomDrugTestCCF() {
    this.newDriver.randomDrugTestCCFs.push({ number: '', date: '' });
  }
  removeRandomDrugTestCCF(index: number) {
    if (this.newDriver.randomDrugTestCCFs.length > 1) {
      this.newDriver.randomDrugTestCCFs.splice(index, 1);
      delete this.selectedFiles['randomDrugTestCCFFile' + index];
    }
  }
  addRandomDrugTestResult() {
    this.newDriver.randomDrugTestResults.push({ number: '', date: '' });
  }
  removeRandomDrugTestResult(index: number) {
    if (this.newDriver.randomDrugTestResults.length > 1) {
      this.newDriver.randomDrugTestResults.splice(index, 1);
      delete this.selectedFiles['randomDrugTestResultFile' + index];
    }
  }
  addMiscDocument() {
    this.newDriver.miscDocuments.push({ name: '', date: '' });
  }
  removeMiscDocument(index: number) {
    if (this.newDriver.miscDocuments.length > 1) {
      this.newDriver.miscDocuments.splice(index, 1);
      delete this.selectedFiles['miscDocumentFile' + index];
    }
  }

  submitForm(form: NgForm) {
    if (form.invalid) {
      this.toastr.error('Please correct the highlighted fields before submitting.', 'Form Submission Error');
      return;
    }
    // Validation for companyId and status
    if (!this.newDriver.companyId || typeof this.newDriver.companyId !== 'string' || !this.newDriver.companyId.trim()) {
      this.toastr.error('Invalid companyId. Please select a valid company.', 'Error');
      return;
    }
    if (!this.newDriver.status || !['APPROVED', 'PENDING', 'EXPIRING'].includes(this.newDriver.status)) {
      this.toastr.error('Invalid status. Please select a valid status.', 'Error');
      return;
    }

    const formData = new FormData();

    // Append text fields (handle arrays as JSON)
    Object.keys(this.newDriver).forEach(key => {
      if (Array.isArray(this.newDriver[key])) {
        formData.append(key, JSON.stringify(this.newDriver[key]));
      } else if (this.newDriver[key] !== undefined && this.newDriver[key] !== null) {
        formData.append(key, this.newDriver[key]);
      }
    });

    // Append file inputs for dynamic sections
    this.newDriver.randomDrugTestCCFs.forEach((_: any, i: number) => {
      const fileKey = 'randomDrugTestCCFFile' + i;
      if (this.selectedFiles[fileKey]) {
        formData.append(fileKey, this.selectedFiles[fileKey]);
      }
    });
    this.newDriver.randomDrugTestResults.forEach((_: any, i: number) => {
      const fileKey = 'randomDrugTestResultFile' + i;
      if (this.selectedFiles[fileKey]) {
        formData.append(fileKey, this.selectedFiles[fileKey]);
      }
    });
    this.newDriver.miscDocuments.forEach((_: any, i: number) => {
      const fileKey = 'miscDocumentFile' + i;
      if (this.selectedFiles[fileKey]) {
        formData.append(fileKey, this.selectedFiles[fileKey]);
      }
    });
    [
      'cdlFile', 'medicalCertificateFile', 'mvrFile', 'backgroundCheckFile', 'pspFile', 'workAuthFile', 'ssnFile',
      'preClearingHouseFile', 'preDrugTestCCFFile', 'preDrugTestResultFile', 'annualClearingHouseFile',
      'pullNoticeFile', 'nationalRegistryFile', 'roadTestFile'
    ].forEach(key => {
      if (this.selectedFiles[key]) {
        formData.append(key, this.selectedFiles[key]);
      }
    });

    this.serviceAuthService.createDriver(formData).subscribe(
      (response: any) => {
        this.toastr.success('Driver created successfully!', 'Success');
        // Remove the form and refresh the page
        form.resetForm();
        this.newDriver = {
          drivingExperiences: [{}],
          accidentRecords: [{}],
          trafficViolations: [{}],
          employmentHistory: [{
            companyName: '', contactNo: '', email: '', street: '', city: '', state: '', zipcode: '', positionHeld: '', startDate: '', endDate: '', reasonForLeaving: '', gapsExplanation: '', fmcsaSubject: '', dotSensitive: ''
          }],
          randomDrugTestCCFs: [{ number: '', date: '' }],
          randomDrugTestResults: [{ number: '', date: '' }],
          miscDocuments: [{ name: '', date: '' }],
          status: 'PENDING',
          companyId: ''
        };
        this.selectedFiles = {};
        this.activeSection = 'personal-info';
        this.loadDrivers();
        // Refresh the page
        window.location.reload();
      },
      (error) => {
        this.toastr.error('Failed to create driver.', 'Error');
      }
    );
  }

 
  setDriverToDelete(id: string) {
    this.driverIdToDelete = id;
  }
 
  deleteDriver(id?: string) {
    if (id) {
      this.serviceAuthService.deleteDriver(id).subscribe((response: any) => {
        console.log('Driver deleted successfully:', response);
        this.toastr.success('driver deleted successfully!', 'Success');
        this.loadDrivers();
        this.driverIdToDelete = null;
      }, error => {
        console.error('Error deleting driver:', error);
        this.toastr.error('Failed to delete driver.', 'Error');
      });
    }
  }
 
  editdriver(driver: any) {
    this.driverToEdit = { ...driver };
    this.originaldriverData = { ...driver }; // Save the original driver data for comparison
  }
 
  driverEditFile(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      // File size validation (10 MB = 10485760 bytes)
      if (file.size > 10485760) {
        this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
        event.target.value = '';
        return;
      }
      this.driverToEdit[key] = file;
      this.selectedFiles[key] = file; // Store file for display
    }
  }
  hasChanges(): boolean {
    // Compare original driver data with the current driverToEdit data
    return JSON.stringify(this.driverToEdit) !== JSON.stringify(this.originaldriverData);
  }
 
updateDriver() {
  if (!this.hasChanges()) {
    this.toastr.error('No changes detected. Please modify the driver details before saving.', 'Error');
    return;
  }

  const formData = new FormData();

  // Append all fields, serialize arrays/objects
  Object.keys(this.driverToEdit).forEach(key => {
    const value = this.driverToEdit[key];
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value) || typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else if (value !== undefined && value !== null) {
      formData.append(key, value.toString());
    }
  });

  // Append dynamic file fields for randomDrugTestCCFs, randomDrugTestResults, miscDocuments
  if (this.driverToEdit.randomDrugTestCCFs) {
    this.driverToEdit.randomDrugTestCCFs.forEach((_: any, i: number) => {
      const fileKey = 'editRandomDrugTestCCFFile' + i;
      if (this.selectedFiles[fileKey]) {
        formData.append(fileKey, this.selectedFiles[fileKey]);
      }
    });
  }
  if (this.driverToEdit.randomDrugTestResults) {
    this.driverToEdit.randomDrugTestResults.forEach((_: any, i: number) => {
      const fileKey = 'editRandomDrugTestResultFile' + i;
      if (this.selectedFiles[fileKey]) {
        formData.append(fileKey, this.selectedFiles[fileKey]);
      }
    });
  }
  if (this.driverToEdit.miscDocuments) {
    this.driverToEdit.miscDocuments.forEach((_: any, i: number) => {
      const fileKey = 'editMiscDocumentFile' + i;
      if (this.selectedFiles[fileKey]) {
        formData.append(fileKey, this.selectedFiles[fileKey]);
      }
    });
  }

  // Append static file fields (cdlFile, medicalCertificateFile, etc.)
  [
    'cdlFile', 'medicalCertificateFile', 'mvrFile', 'backgroundCheckFile', 'pspFile', 'workAuthFile', 'ssnFile',
    'preClearingHouseFile', 'preDrugTestCCFFile', 'preDrugTestResultFile', 'annualClearingHouseFile',
    'pullNoticeFile', 'nationalRegistryFile', 'roadTestFile'
  ].forEach(key => {
    if (this.selectedFiles[key]) {
      formData.append(key, this.selectedFiles[key]);
    }
  });

  this.serviceAuthService.updateDriver(this.driverToEdit._id, formData).subscribe(
    (response: any) => {
      this.toastr.success('Driver updated successfully!', 'Success');
      this.loadDrivers();
      this.driverToEdit = {};
      this.selectedFiles = {};
      this.closeEditModal();
    },
    error => {
      this.toastr.error('Failed to update driver.', 'Error');
    }
  );
}
  editDriver(driver: any) {
    this.driverToEdit = { ...driver };
    console.log('Editing driver:', driver);
    const offcanvasElement = document.getElementById('editDriverModal');
    if (offcanvasElement) {
      this.renderer.addClass(offcanvasElement, 'show');
      this.renderer.setStyle(offcanvasElement, 'visibility', 'visible');
      offcanvasElement.setAttribute('aria-modal', 'true');
      offcanvasElement.removeAttribute('aria-hidden');

      const backdrop = document.createElement('div');
      backdrop.className = 'offcanvas-backdrop fade show';
      document.body.appendChild(backdrop);
    }
  }

  closeEditModal() {
    const offcanvasElement = document.getElementById('editDriverModal');
    if (offcanvasElement) {
      this.renderer.removeClass(offcanvasElement, 'show');
      this.renderer.setStyle(offcanvasElement, 'visibility', 'hidden');
      offcanvasElement.setAttribute('aria-hidden', 'true');
      offcanvasElement.removeAttribute('aria-modal');

      const backdrop = document.querySelector('.offcanvas-backdrop');
      if (backdrop) {
        this.renderer.removeChild(document.body, backdrop);
      }
    }
  }

  get paginatedDrivers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredDrivers.slice(startIndex, endIndex);
  }
 
  changePage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }
 
  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }
 
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
 
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
 
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
 
    return pageNumbers;
  }

setupOffcanvasClose() {
  this.sharedUtilityService.setupOffcanvasClose(this.renderer);
}
 searchDrivers() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredDrivers = [...this.drivers];
    } else {
      this.filteredDrivers = this.drivers.filter(driver => {
        const name = (driver.driverName || '').toLowerCase();
        const email = (driver.companyEmail || '').toLowerCase();
        const company = (driver.companyName || '').toLowerCase();
        return name.includes(term) || email.includes(term) || company.includes(term);
      });
    }
    this.currentPage = 1;
  }

  // Dropdown state controls for address and CDL fields
  dropdownOpen = false;
  mailingDropdownOpen = false;
  previousDropdownOpen = false;
  currentCdlDropdownOpen = false;
  oldCdlDropdownOpen = false;

  // Hover state for dropdowns
  hovered: string | null = null;
  mailingHovered: string | null = null;
  previousHovered: string | null = null;
  currentCdlHovered: string | null = null;
  oldCdlHovered: string | null = null;

  // List of US states (should be defined somewhere in your component)
  usStates = [
  { abbr: 'AL', name: 'Alabama' }, { abbr: 'AK', name: 'Alaska' }, { abbr: 'AZ', name: 'Arizona' },
  { abbr: 'AR', name: 'Arkansas' }, { abbr: 'CA', name: 'California' }, { abbr: 'CO', name: 'Colorado' },
  { abbr: 'CT', name: 'Connecticut' }, { abbr: 'DE', name: 'Delaware' }, { abbr: 'FL', name: 'Florida' },
  { abbr: 'GA', name: 'Georgia' }, { abbr: 'HI', name: 'Hawaii' }, { abbr: 'ID', name: 'Idaho' },
  { abbr: 'IL', name: 'Illinois' }, { abbr: 'IN', name: 'Indiana' }, { abbr: 'IA', name: 'Iowa' },
  { abbr: 'KS', name: 'Kansas' }, { abbr: 'KY', name: 'Kentucky' }, { abbr: 'LA', name: 'Louisiana' },
  { abbr: 'ME', name: 'Maine' }, { abbr: 'MD', name: 'Maryland' }, { abbr: 'MA', name: 'Massachusetts' },
  { abbr: 'MI', name: 'Michigan' }, { abbr: 'MN', name: 'Minnesota' }, { abbr: 'MS', name: 'Mississippi' },
  { abbr: 'MO', name: 'Missouri' }, { abbr: 'MT', name: 'Montana' }, { abbr: 'NE', name: 'Nebraska' },
  { abbr: 'NV', name: 'Nevada' }, { abbr: 'NH', name: 'New Hampshire' }, { abbr: 'NJ', name: 'New Jersey' },
  { abbr: 'NM', name: 'New Mexico' }, { abbr: 'NY', name: 'New York' }, { abbr: 'NC', name: 'North Carolina' },
  { abbr: 'ND', name: 'North Dakota' }, { abbr: 'OH', name: 'Ohio' }, { abbr: 'OK', name: 'Oklahoma' },
  { abbr: 'OR', name: 'Oregon' }, { abbr: 'PA', name: 'Pennsylvania' }, { abbr: 'RI', name: 'Rhode Island' },
  { abbr: 'SC', name: 'South Carolina' }, { abbr: 'SD', name: 'South Dakota' }, { abbr: 'TN', name: 'Tennessee' },
  { abbr: 'TX', name: 'Texas' }, { abbr: 'UT', name: 'Utah' }, { abbr: 'VT', name: 'Vermont' },
  { abbr: 'VA', name: 'Virginia' }, { abbr: 'WA', name: 'Washington' }, { abbr: 'WV', name: 'West Virginia' },
  { abbr: 'WI', name: 'Wisconsin' }, { abbr: 'WY', name: 'Wyoming' }
];

  addEmploymentHistory() {
    this.newDriver.employmentHistory.push({
      companyName: '',
      contactNo: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zipcode: '',
      positionHeld: '',
      startDate: '',
      endDate: '',
      reasonForLeaving: '',
      gapsExplanation: '',
      fmcsaSubject: '',
      dotSensitive: ''
    });
  }

  removeEmploymentHistory(index: number) {
    if (this.newDriver.employmentHistory.length > 1) {
      this.newDriver.employmentHistory.splice(index, 1);
    }
  }

  // Helper to get state name from abbreviation
getStateName(abbr: string): string | undefined {
  const state = this.usStates.find(s => s.abbr === abbr);
  return state ? state.name : undefined;
}

// Select handlers for dropdowns
selectState(abbr: string) {
  this.newDriver.currentAddressState = abbr;
}
selectMailingState(abbr: string) {
  this.newDriver.mailingAddressState = abbr;
}
selectPreviousState(abbr: string) {
  this.newDriver.previousAddressState = abbr;
}
selectCurrentCdlState(abbr: string) {
  this.newDriver.currentCdlState = abbr;
}
selectOldCdlState(abbr: string) {
  this.newDriver.oldCdlState = abbr;
}




// Edit select handlers for dropdowns
selectEditState(abbr: string) {
  this.driverToEdit.currentAddressState = abbr;
}
selectEditMailingState(abbr: string) {
  this.driverToEdit.mailingAddressState = abbr;
}
selectEditPreviousState(abbr: string) {
  this.driverToEdit.previousAddressState = abbr;
}
// Edit CDL select handlers
selectEditCurrentCdlState(abbr: string) {
  this.driverToEdit.currentCdlState = abbr;
}
selectEditOldCdlState(abbr: string) {
  this.driverToEdit.oldCdlState = abbr;
}

}







