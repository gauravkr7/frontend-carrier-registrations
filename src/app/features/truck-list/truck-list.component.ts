import { Component, OnInit, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { Offcanvas } from 'bootstrap';
import { HttpClient } from '@angular/common/http';
import { SharedUtilityService } from '../../shared/shared-utility.service';

 
@Component({
  selector: 'app-truck-list',
  templateUrl: './truck-list.component.html',
  styleUrls: ['./truck-list.component.css']
})
export class TruckListComponent implements OnInit {
 
  trucks: any[] = [];
  filteredTrucks: any[] = [];
  paginatedTrucks: any[] = [];
  newTruck: any = {};
  truckIdToDelete: string | null = null;
  // truckToEdit: any = {};
  truckToEdit: any = {
    truckModel: '', // Ensure this is set to a valid model like 'Cascadia' for testing
    engineMake: '', // Ensure this is set to a valid make like 'Detroit' for testing
    engineModel: '',
    // ...other properties...
  };
  originalTruckData: any = {};
  fileError: string | null = null;
  companies: any[] = [];
  activeSection: string = 'company-info';
  isSidebarOpen: boolean = false;
  selectedFiles: { [key: string]: File } = {};
  nonCompliantTrucks: number = 0;
  compliantTrucks: number = 0;
  expiringTrucks: number = 0;
  activeFilter: string = 'all';
 
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  totalTrucks: number = 0;
  pageSize: number = 10; // Set this to your actual page size
  lastEditedTruckId: string | null = null;
  searchTerm: string = '';
 
  constructor(
    private serviceAuthService: ServiceAuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private router: Router,
    private http: HttpClient,
    private sharedUtilityService: SharedUtilityService
  ) {}
 
  ngOnInit(): void {
    this.loadTrucks();
    this.loadCompany();
    this.fetchCompanies();
    this.setupOffcanvasClose();
  }
 
  findCompanyName(companyId: string | string[]): string {
    if (Array.isArray(companyId)) {
      companyId = companyId.length > 0 ? companyId[0] : '';
    }
    const company = this.companies.find(company => company._id === companyId);
    return company ? company.companyName : 'N/A';
  }
 
  loadCompany() {
    this.serviceAuthService.getAllCompanies().subscribe(
      (data: any) => {
        this.companies = data;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading companies:', error);
      }
    );
  }
 
  fetchCompanies(): void {
    this.http.get('/api/companies').subscribe((data: any) => {
      this.companies = data;
    });
  }
 
  loadTrucks() {
    this.serviceAuthService.getTrucksFromAPI().subscribe(
      (trucks: any) => {
        this.trucks = trucks;
        this.filteredTrucks = trucks;
        this.totalItems = this.filteredTrucks.length;
        this.totalTrucks = trucks.length;
        this.nonCompliantTrucks = trucks.filter((truck: { status: string; }) => truck.status === 'PENDING').length; // Calculate non-compliant trucks
        this.compliantTrucks = trucks.filter((truck: { status: string; }) => truck.status === 'APPROVED').length; // Calculate compliant trucks
        this.expiringTrucks = trucks.filter((truck: { status: string; }) => truck.status === 'EXPIRING').length; // Calculate expiring trucks
        this.updatePaginatedTrucks();
        this.cdr.detectChanges();
      },
      (error) => {
        console.error(error);
        this.toastr.error('Failed to load trucks.', 'Error');
      }
    );
  }
 
  filterTrucks(filterType: string) {
    this.activeFilter = filterType; // Update the active filter
 
 
    if (filterType === 'all') {
      this.filteredTrucks = this.trucks;
    } else if (filterType === 'nonCompliant') {
      this.filteredTrucks = this.trucks.filter((truck) => truck.status === 'PENDING');
    } else if (filterType === 'compliant') {
      this.filteredTrucks = this.trucks.filter((truck) => truck.status === 'APPROVED');
    } else if (filterType === 'expiring') {
      this.filteredTrucks = this.trucks.filter((truck) => truck.status === 'EXPIRING');
    }
    this.currentPage = 1;
    this.updatePaginatedTrucks();
    this.cdr.detectChanges();
  }

  
 

  onFileChange(event: Event, key: string, isMultiple: boolean = false, isEdit: boolean = false): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      // File size validation (10 MB = 10485760 bytes)
      const oversizedFile = files.find(file => file.size > 10485760);
      if (oversizedFile) {
        this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
        input.value = '';
        return;
      }
      if (isEdit) {
        // Edit mode
        if (isMultiple) {
          this.truckToEdit[key] = [...(this.truckToEdit[key] || []), ...files];
        } else {
          this.truckToEdit[key] = files[0];
          this.selectedFiles[key] = files[0];
        }
      } else {
        // Add mode
        if (isMultiple) {
          this.newTruck[key] = [...(this.newTruck[key] || []), ...files];
        } else {
          this.newTruck[key] = files[0];
          this.selectedFiles[key] = files[0];
        }
      }
      input.value = '';
    }
  }
  removeFile(file: File, key: string, isEdit: boolean = false): void {
    if (isEdit) {
      this.truckToEdit[key] = (this.truckToEdit[key] || []).filter((f: File) => f !== file);
    } else {
      this.newTruck[key] = (this.newTruck[key] || []).filter((f: File) => f !== file);
    }
  }

  submitForm(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach((field) => {
        const control = form.control.get(field);
        if (control) {
          control.markAsTouched({ onlySelf: true });
        }
      });

      this.toastr.error('Please correct the highlighted fields before submitting.', 'Form Submission Error');
      return;
    }

    if (!this.newTruck.companyId || typeof this.newTruck.companyId !== 'string') {
      this.toastr.error('Invalid companyId. Please select a valid company.', 'Error');
      return;
    }

    const formData = new FormData();

    Object.keys(this.newTruck).forEach((key) => {
      if (key === 'companyId') {
        formData.append(key, this.newTruck[key].toString().trim());
      } else if (Array.isArray(this.newTruck[key]) && this.newTruck[key].length > 0) {
        this.newTruck[key].forEach((file: File) => {
          formData.append(key, file, file.name); // Append each file with its name
        });
      } else if (this.newTruck[key] instanceof File) {
        formData.append(key, this.newTruck[key], this.newTruck[key].name); // Append single file with its name
      } else {
        formData.append(key, String(this.newTruck[key])); // Append non-file fields
      }
    });

    this.serviceAuthService.createTruck(formData).subscribe(
      (response: any) => {
        this.toastr.success('Truck created successfully!', 'Success');
        this.loadTrucks();
        this.newTruck = {};
        this.selectedFiles = {};
        form.resetForm();
        this.closeOffCanvas();
      },
      (error) => {
        console.error('Error creating truck:', error);
        this.toastr.error('Failed to create truck.', 'Error');
      }
    );
  }
  setTruckToDelete(id: string) {
    this.truckIdToDelete = id;
  }
 
  deleteTruck(id?: string) {
    if (id) {
      this.serviceAuthService.deleteTruck(id).subscribe(
        (response: any) => {
          this.toastr.success('Truck deleted successfully!', 'Success');
          this.loadTrucks();
          this.truckIdToDelete = null;
        },
        (error) => {
          console.error('Error deleting truck:', error);
          this.toastr.error('Failed to delete truck.', 'Error');
        }
      );
    }
  }
 
  editTruck(truck: any) {
    this.truckToEdit = { ...truck };
    if (this.lastEditedTruckId !== truck._id) {
      this.activeSection = 'company-info'; // Reset only if editing a different truck
    }
    this.lastEditedTruckId = truck._id;
    this.originalTruckData = { ...truck };
  }
 
  truckEditFile(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      // File size validation (10 MB = 10485760 bytes)
      if (file.size > 10485760) {
        this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
        event.target.value = '';
        return;
      }
      this.truckToEdit[key] = file;
    }
  }
 
  hasChanges(): boolean {
    return JSON.stringify(this.truckToEdit) !== JSON.stringify(this.originalTruckData);
  }
 
  updateTruck() {
    if (!this.hasChanges()) {
      this.toastr.error('No changes detected. Please modify the truck details before saving.', 'Error');
      return;
    }
 
    const formData = new FormData();
    Object.keys(this.truckToEdit).forEach((key) => {
      if (Array.isArray(this.truckToEdit[key]) && this.truckToEdit[key].length > 0) {
        this.truckToEdit[key].forEach((file: File) => {
          if (file instanceof File) {
            formData.append(key, file, file.name);
          } else {
            formData.append(key, file);
          }
        });
      } else if (this.truckToEdit[key] instanceof File) {
        formData.append(key, this.truckToEdit[key], this.truckToEdit[key].name);
      } else {
        formData.append(key, String(this.truckToEdit[key]));
      }
    });
 
    this.serviceAuthService.updateTruck(this.truckToEdit._id, formData).subscribe(
      (response: any) => {
        this.toastr.success('Truck updated successfully!', 'Success');
        this.loadTrucks();
        this.truckToEdit = {};
        this.originalTruckData = {};
        this.closeOffCanvas();
      },
      (error) => {
        console.error('Error updating truck:', error);
        this.toastr.error('Failed to update truck.', 'Error');
      }
    );
  }
 
  openForm() {
    this.activeSection = 'company-info';
  }
 
  goToSection(section: string) {
    this.activeSection = section;
  }
 
  showSection(sectionId: string): void {
    this.activeSection = sectionId;
  }
 
  onClose(): void {
    this.closeOffCanvas();
    this.toastr.info('Closed successfully.');
  }
 
  onSave(): void {
    this.toastr.success('Save changes button clicked.');
  }
 
  onNext(): void {
    this.toastr.info('Next button clicked.');
  }
 
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar state:', this.isSidebarOpen);
  }
 
  closeOffCanvas() {
    console.log('Off-canvas menu closed');
  }
 
  navigateToTruckListView() {
    this.router.navigate(['/truck-list-view']);
  }
 
  getTotalPages(): number {
    return Math.ceil(this.filteredTrucks.length / this.itemsPerPage);
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

  changePage(page: number) {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    this.updatePaginatedTrucks();
  }

  updatePaginatedTrucks() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedTrucks = this.filteredTrucks.slice(start, end);
  }
 onTruckMakeChange() {
  this.newTruck.truckModel = '';
  this.newTruck.engineMake = '';
  this.newTruck.engineModel = '';
}

onEngineMakeChange() {
  this.newTruck.engineModel = '';
}
onEditTruckMakeChange() {
  this.truckToEdit.truckModel = '';
  this.truckToEdit.engineMake = '';
  this.truckToEdit.engineModel = '';
}

onEditEngineMakeChange() {
  this.truckToEdit.engineModel = '';
}

searchTrucks() {
  const term = this.searchTerm.trim().toLowerCase();
  if (!term) {
    this.filteredTrucks = [...this.trucks];
  } else {
    this.filteredTrucks = this.trucks.filter(truck => {
      const unitNumber = (truck.unitNumber || '').toLowerCase();
      const companyName = (this.findCompanyName(truck.companyId) || '').toLowerCase();
      return unitNumber.includes(term) || companyName.includes(term);
    });
  }
  this.currentPage = 1;
  this.updatePaginatedTrucks();
}
}







