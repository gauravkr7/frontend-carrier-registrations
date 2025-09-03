import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import { SharedUtilityService } from '../../shared/shared-utility.service';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.css']
})
export class VendorComponent implements OnInit {
  filteredVendors: any[] = [];
  isSidebarOpen: boolean = false;
  vendors: any[] = [];
  vendorForm!: FormGroup;
  fileError: string | null = null;
  selectedFiles: { [key: string]: File | null } = {};
  accountingData: any[] = []; // Add this property to store accounting data
  filteredAccountingData: any[] = [];
  currentPage: number = 1; // Ensure currentPage starts at 1
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalTrucks: number = 0;
  cdr: any;

  searchTerm: string = '';

  constructor(
    private fb: FormBuilder,
    private vendorService: ServiceAuthService,
    private toastr: ToastrService,
    private renderer: Renderer2,

    private sharedUtilityService: SharedUtilityService,
  ) { }

  ngOnInit(): void {
    this.loadVendors();
    this.initializeForm();
    this.setupOffcanvasClose();
    this.fetchAccountingData();
    this.filteredVendors = [...this.vendors];

  }


  fetchAccountingData(): void {
    this.vendorService.getAccountPermitFromAPI().subscribe(
      (response: any) => {
        console.log('Fetched accounting data:', response);
        this.accountingData = response;
        // Filter out accounts with type 'Expense'
        this.filteredAccountingData = this.accountingData.filter(account => account.type === 'Expense');
      },
      (error) => {
        console.error('Error fetching accounting data:', error);
        this.toastr.error('Failed to fetch accounting data', 'Error');
      }
    );
  }
  resetForm(): void {
    this.vendorForm.reset();
    this.selectedFiles = {};
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar state:', this.isSidebarOpen);
  }
  // ...existing code...

  initializeForm() {
    this.vendorForm = this.fb.group({
      vendorID: ['', Validators.required],
      accountType: ['', Validators.required],
      vendorName: ['', Validators.required],
      businessStructure: ['', Validators.required],
      primaryContactName: ['', Validators.required],
      primaryContactPhone: ['', Validators.required],
      primaryContactEmail: ['', Validators.required],
      secondaryContactName: [''],
      secondaryContactPhone: [''],
      secondaryContactEmail: [''],
      streetAddress: ['', Validators.required],
      city: ['', Validators.required],
      stateProvince: ['', Validators.required],
      zipPostalCode: ['', Validators.required],
      country: ['', Validators.required],
      complianceCertificatesDocumentation: [''],
      taxID_EIN: ['', Validators.required],
      paymentTerms: ['', Validators.required],
      websiteURL: [''],
      operatingRegions: [''],
      status: ['', Validators.required],
      notesComments: [''],
      licensePermitRegistrationNumber: [''],
      feeType: [''],
      feeAmount: [''],
      renewalExpirationDate: [''],
      paymentReferenceConfirmationNumber: [''],
      jurisdictionAuthority: [''],
      createdBy: [''],
      superadminId: ['']
    });
  }
  editVendor(vendor: any) {
    this.vendorForm.patchValue({
      vendorID: vendor.vendorID,
      vendorName: vendor.vendorName,
      businessStructure: vendor.businessStructure,
      primaryContactName: vendor.primaryContactName,
      primaryContactPhone: vendor.primaryContactPhone,
      primaryContactEmail: vendor.primaryContactEmail,
      secondaryContactName: vendor.secondaryContactName,
      secondaryContactPhone: vendor.secondaryContactPhone,
      secondaryContactEmail: vendor.secondaryContactEmail,
      streetAddress: vendor.streetAddress,
      city: vendor.city,
      stateProvince: vendor.stateProvince,
      zipPostalCode: vendor.zipPostalCode,
      country: vendor.country,
      complianceCertificatesDocumentation: vendor.complianceCertificatesDocumentation,
      taxID_EIN: vendor.taxID_EIN,
      paymentTerms: vendor.paymentTerms,
      websiteURL: vendor.websiteURL,
      operatingRegions: vendor.operatingRegions,
      status: vendor.status,
      notesComments: vendor.notesComments,
      licensePermitRegistrationNumber: vendor.licensePermitRegistrationNumber,
      feeType: vendor.feeType,
      feeAmount: vendor.feeAmount,
      renewalExpirationDate: vendor.renewalExpirationDate,
      paymentReferenceConfirmationNumber: vendor.paymentReferenceConfirmationNumber,
      jurisdictionAuthority: vendor.jurisdictionAuthority,
      createdBy: vendor.createdBy,
      superadminId: vendor.superadminId
    });
  }

  fetchCompanyDetails() {
    return this.vendorService.getAllCompanies();
  }

  // vendor.component.ts
  loadVendors() {
    this.vendorService.getAllVendors().subscribe(
      (data: any) => {
        this.vendors = data.venders;
        this.filteredVendors = [...this.vendors]; // Ensure table shows all vendors by default

        console.log('Vendors loaded:', this.vendors);
      },
      (error: any) => {
        console.error('Error loading vendors:', error);
        this.toastr.error('Failed to load vendors.', 'Error');
      }
    );
  }



  // ...existing code...



  submitVendor(): void {
    if (this.vendorForm.invalid) {
      this.markAllAsTouched();
      this.toastr.error('Please fill in all required fields.', 'Form Error');
      return;
    }

    this.fetchCompanyDetails().subscribe(
      (data: any) => {
        const formData = new FormData();

        // Fetch company details
        const companyDetails = data;

        // Convert non-string values
        const formValues = {
          ...this.vendorForm.value,
          feeAmount: Number(this.vendorForm.value.feeAmount),
          renewalExpirationDate: new Date(this.vendorForm.value.renewalExpirationDate).toISOString(),
          superadminId: companyDetails.superadminId,
          createdBy: companyDetails.createdBy
        };

        // Append all fields except the file
        Object.keys(formValues).forEach(key => {
          if (key !== 'complianceCertificatesDocumentation') {
            const value = formValues[key] ?? '';
            formData.append(key, value.toString()); // Ensure string values
          }
        });

        // Append file with correct field name
        if (this.selectedFiles['complianceCertificatesDocumentation']) {
          formData.append(
            'complianceCertificatesDocumentation',
            this.selectedFiles['complianceCertificatesDocumentation'],
            this.selectedFiles['complianceCertificatesDocumentation'].name
          );
        } else {
          this.toastr.error('Compliance Certificates Documentation is required.', 'Form Error');
          return;
        }

        this.vendorService.createVender(formData).subscribe(
          (response: any) => {
            this.toastr.success('Vendor created successfully!', 'Success');
            this.loadVendors();
            this.vendorForm.reset();
            this.selectedFiles = {};

            // Reset file input
            const fileInput = document.getElementById('complianceCertificatesDocumentation') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
          },
          (error: any) => {
            console.error('Error creating vendor:', error);
            this.toastr.error(error.error.message || 'Failed to create vendor.', 'Error');
          }
        );
      },
      (error: any) => {
        console.error('Error fetching company details:', error);
        this.toastr.error('Failed to fetch company details.', 'Error');
      }
    );
  }
  markAllAsTouched() {
    Object.keys(this.vendorForm.controls).forEach(field => {
      const control = this.vendorForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  getVendor(id: string) {
    this.vendorService.getVenderById(id).subscribe(
      (data: any) => {
        this.vendorForm.patchValue(data); // Populate the form with the vendor data
      },
      (error: any) => {
        console.error('Error fetching vendor:', error);
        this.toastr.error('Failed to fetch vendor.', 'Error');
      }
    );
  }

  // updateVendor(id: string) {
  //   if (this.vendorForm.invalid) {
  //     this.toastr.error('Please fill in all required fields.', 'Form Error');
  //     return;
  //   }

  //   this.vendorService.updateVender(id, this.vendorForm.value).subscribe(
  //     (response: any) => {
  //       this.toastr.success('Vendor updated successfully!', 'Success');
  //       this.loadVendors(); // Reload vendors to update the list
  //     },
  //     (error: any) => {
  //       console.error('Error updating vendor:', error);
  //       this.toastr.error('Failed to update vendor.', 'Error');
  //     }
  //   );
  // }

  deleteVendor(id: string) {
    console.log('Deleting vendor ID:', id); // Add this line
    this.vendorService.deleteVender(id).subscribe(
      (response: any) => {
        this.toastr.success('Vendor deleted successfully!', 'Success');
        this.loadVendors(); // Reload vendors to update the list
      },
      (error: any) => {
        console.error('Error deleting vendor:', error);
        this.toastr.error('Failed to delete vendor.', 'Error');
      }
    );
  }
  onFileChange(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.fileError = 'Only JPG, PNG, and PDF files are allowed';
        return;
      }

      // File size validation (10 MB = 10485760 bytes)
      if (file.size > 10485760) {
        this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
        input.value = '';
        return;
      }

      this.selectedFiles[field] = file;
      this.fileError = null;
    } else {
      this.selectedFiles[field] = null;
      this.fileError = 'No file selected';
    }
  }

  updateVendor(): void {
    if (this.vendorForm.invalid) {
      this.markAllAsTouched();
      this.toastr.error('Please fill in all required fields.', 'Form Error');
      return;
    }

    const formData = new FormData();
    const vendorId = this.vendorForm.value.vendorID;

    // Append all form fields to FormData
    Object.keys(this.vendorForm.value).forEach(key => {
      const value = this.vendorForm.value[key];

      if (key === 'complianceCertificatesDocumentation') {
        const file = this.selectedFiles[key];
        if (file) {
          formData.append(key, file, file.name);
        } else {
          // Ensure API does not ignore the field
          formData.append(key, '');
        }
      } else {
        formData.append(key, value ?? '');
      }
    });


    const formDataObj: any = {};
    formData.forEach((value, key) => {
      if (value instanceof File) {
        formDataObj[key] = value.name;
        console.log(key, value.name);
      } else {
        formDataObj[key] = value;
        console.log(key, value);
      }
    });
    // Show all data as an object for easier inspection
    console.log('Full data object being sent to backend:', formDataObj);

    this.vendorService.updateVender(vendorId, formData).subscribe({
      next: (response) => {
        this.toastr.success('Vendor updated successfully!', 'Success');
        this.loadVendors();
        this.resetForm();
      },
      error: (err) => {
        console.error('Error updating vendor:', err);
        this.toastr.error(err.message || 'Failed to update vendor.', 'Error');
      }
    });
  }
  onClose(): void {
    this.closeOffCanvas();
    this.toastr.info('Closed successfully.');
  }
  closeOffCanvas() {
    throw new Error('Method not implemented.');
  }

  get paginatedTrucks() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredVendors.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      // Add logic to fetch data for the selected page if necessary
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.vendors.length / this.itemsPerPage); // Ensure total pages calculation is correct
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1); // Ensure page 1 is included
  }
  setupOffcanvasClose() {
    this.sharedUtilityService.setupOffcanvasClose(this.renderer);
  }
  getAccountDetails(accountId: string): string {
    const account = this.accountingData.find(acc => acc.accountId === accountId);
    return account ? `${account.accountName} (${account.accountId})` : accountId; // Return both accountName and accountId
  }
  searchVendors() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredVendors = [...this.vendors];
    } else {
      this.filteredVendors = this.vendors.filter(vendor => {
        const id = (vendor.vendorID || '').toLowerCase();
        const name = (vendor.vendorName || '').toLowerCase();
        const accountType = (this.getAccountDetails(vendor.accountType) || '').toLowerCase();
        return id.includes(term) || name.includes(term) || accountType.includes(term);
      });
    }
  }
}
