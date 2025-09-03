import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import { Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { Offcanvas } from 'bootstrap'; // Import Offcanvas from Bootstrap
import { SharedUtilityService } from '../../shared/shared-utility.service';

@Component({
  selector: 'app-trailer-list',
  templateUrl: './trailer-list.component.html',
  styleUrls: ['./trailer-list.component.css']
})
export class TrailerListComponent implements OnInit {

  documentName: string | null = null; // Add this property
  ninetyDaysDocument: string[] | undefined; // Supports multiple files
  annualInspectionDocument: string[] | undefined; // Supports multiple files
  maintenanceDocument: string[] | undefined; // Supports multiple files
  searchTerm: string = '';

  allTrailers: any[] = [];
  filteredTrailers: any[] = [];
  newTrailer: any = {};
  trailerIdToDelete: string | null = null;
  trailerToEdit: any = {};
  originalTrailerData: any = {};
  lastEditedTrailerId: string | null = null;
  fileError: string | null = null;
  companies: any[] = [];
  activeSection: string = 'company-info';
  isSidebarOpen: boolean = false; // Default value
  selectedFiles: { [key: string]: File | null } = {};
  nonCompliantTrailers: number = 0;
  compliantTrailers: number = 0;
  expiringTrailers: number = 0;
  totalTrailers: number = 0;
  activeFilter: string = 'all';
 
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
 
  constructor(
    private serviceAuthService: ServiceAuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private sharedUtilityService: SharedUtilityService,
    private router: Router // Inject Router
  ) {}
 
  ngOnInit(): void {
    this.loadTrailers();
    this.loadCompany();
    this.setupOffcanvasClose(); // Add this line
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
 
  loadTrailers() {
    this.serviceAuthService.getTrailersFromAPI().subscribe(
      (trailers: any) => {
        this.allTrailers = trailers;
        this.filteredTrailers = trailers;
        this.totalItems = this.filteredTrailers.length;
        this.totalTrailers = trailers.length;
        this.nonCompliantTrailers = trailers.filter((trailer: { status: string; }) => trailer.status === 'PENDING').length; // Calculate non-compliant trailer
        this.compliantTrailers = trailers.filter((trailer: { status: string; }) => trailer.status === 'APPROVED').length; // Calculate compliant trailer
        this.expiringTrailers = trailers.filter((trailer: { status: string; }) => trailer.status === 'EXPIRING').length; // Calculate expiring trailer
        this.cdr.detectChanges();
      },
      (error) => {
        console.error(error);
        this.toastr.error('Failed to load trailers.', 'Error');
      }
    );
  }

  
 
  filterTrailers(filterType: string) {
    this.activeFilter = filterType; // Update the active filter
    this.currentPage = 1;
    if (filterType === 'all') {
      this.filteredTrailers = [...this.allTrailers];
    } else if (filterType === 'nonCompliant') {
      this.filteredTrailers = this.allTrailers.filter((trailer) => trailer.status === 'PENDING');
    } else if (filterType === 'compliant') {
      this.filteredTrailers = this.allTrailers.filter((trailer) => trailer.status === 'APPROVED');
    } else if (filterType === 'expiring') {
      this.filteredTrailers = this.allTrailers.filter((trailer) => trailer.status === 'EXPIRING');
    }
    // No need to call updatePaginatedTrailers()
    this.cdr.detectChanges();
  }

 
  removeFile(file: File, key: string, isEdit: boolean = false): void {
    if (isEdit) {
      if (Array.isArray(this.trailerToEdit[key])) {
        this.trailerToEdit[key] = this.trailerToEdit[key].filter((f: File) => f !== file);
      }
    } else {
      if (Array.isArray(this.newTrailer[key])) {
        this.newTrailer[key] = this.newTrailer[key].filter((f: File) => f !== file);
      }
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

    if (!this.newTrailer.companyId || typeof this.newTrailer.companyId !== 'string') {
      this.toastr.error('Invalid companyId. Please select a valid company.', 'Error');
      return;
    }

    const formData = new FormData();

    Object.keys(this.newTrailer).forEach((key) => {
      if (key === 'companyId') {
        formData.append(key, this.newTrailer[key].toString().trim());
      } else if (Array.isArray(this.newTrailer[key]) && this.newTrailer[key].length > 0) {
        this.newTrailer[key].forEach((file: File) => {
          formData.append(key, file, file.name); // Append each file with its name
        });
      } else if (this.newTrailer[key] instanceof File) {
        formData.append(key, this.newTrailer[key], this.newTrailer[key].name); // Append single file with its name
      } else {
        formData.append(key, String(this.newTrailer[key])); // Append non-file fields
      }
    });

    this.serviceAuthService.createTrailer(formData).subscribe(
      (response: any) => {
        this.toastr.success('Trailer created successfully!', 'Success');
        this.loadTrailers();
        this.newTrailer = {};
        this.selectedFiles = {};
        form.resetForm();
        this.closeOffCanvas();
      },
      (error) => {
        console.error('Error creating trailer:', error);
        this.toastr.error('Failed to create trailer.', 'Error');
      }
    );
  }
 
  setTrailerToDelete(id: string) {
    this.trailerIdToDelete = id;
  }
 
  deleteTrailer(id?: string) {
    if (id) {
      this.serviceAuthService.deleteTrailer(id).subscribe(
        (response: any) => {
          this.toastr.success('Trailer deleted successfully!', 'Success');
          this.loadTrailers();
          this.trailerIdToDelete = null;
        },
        (error) => {
          console.error('Error deleting trailer:', error);
          this.toastr.error('Failed to delete trailer.', 'Error');
        }
      );
    }
  }
 
 
 
  editTrailer(trailer: any) {
    this.trailerToEdit = { ...trailer };
    if (this.lastEditedTrailerId !== trailer._id) {
      this.activeSection = 'company-info'; // Reset only if editing a different trailer
    }
    this.lastEditedTrailerId = trailer._id;
    this.originalTrailerData = { ...trailer };
   
  }
 
  
 
  // trailerEditFile(event: any, key: string) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     this.trailerToEdit[key] = file;
  //   }
  // }
 
  // hasChanges(): boolean {
  //   return JSON.stringify(this.trailerToEdit) !== JSON.stringify(this.originalTrailerData);
  // }
 
  updateTrailer() {
    if (!this.hasChanges()) {
      this.toastr.error('No changes detected. Please modify the trailer details before saving.', 'Error');
      return;
    }
 
    const formData = new FormData();
    Object.keys(this.trailerToEdit).forEach((key) => {
      formData.append(key, this.trailerToEdit[key]);
    });
 
    this.serviceAuthService.updateTrailer(this.trailerToEdit._id, formData).subscribe(
      (response: any) => {
        this.toastr.success('Trailer updated successfully!', 'Success');
        this.loadTrailers();
        this.trailerToEdit = {};
        this.originalTrailerData = {};
      },
      (error) => {
        console.error('Error updating trailer:', error);
        this.toastr.error('Failed to update trailer.', 'Error');
      }
    );
  }
 
  openForm() {
    this.activeSection = 'company-info'; // Change this to the section you want to show
  }
 
  goToSection(section: string , event: Event)
   {
    event.stopPropagation();
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

  // isSidebarOpen = false; 
  // Initially closed
 
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar state:', this.isSidebarOpen); // Debugging log
  }
  closeOffCanvas() {
    // Implement the logic to close the off-canvas menu
    console.log('Off-canvas menu closed');
  }
 
  // Added method for navigation
  navigateToTrailerListView() {
    this.router.navigate(['/trailer-list-view']);  // Using Router to navigate programmatically
  }



  get paginatedTrailers() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredTrailers.slice(startIndex, endIndex);
  }
 
  changePage(page: number) {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
    // No need to call updatePaginatedTrailers()
  }
 
  getTotalPages(): number {
    return Math.ceil(this.filteredTrailers.length / this.itemsPerPage) || 1;
  }
 
  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  setupOffcanvasClose() {
    this.sharedUtilityService.setupOffcanvasClose(this.renderer);
  }
   trailerEditFile(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      // File size validation (10 MB = 10485760 bytes)
      if (file.size > 10485760) {
        this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
        event.target.value = '';
        return;
      }
      this.trailerToEdit[key] = file;
    }
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
        if (isMultiple) {
          this.trailerToEdit[key] = [...(this.trailerToEdit[key] || []), ...files];
        } else {
          this.trailerToEdit[key] = files[0];
        }
      } else {
        if (isMultiple) {
          this.newTrailer[key] = [...(this.newTrailer[key] || []), ...files];
        } else {
          this.newTrailer[key] = files[0];
          this.selectedFiles[key] = files[0];
        }
      }
      input.value = ''; // Clear the input value to allow re-upload of the same file
    }
  }
  hasChanges(): boolean {
    return JSON.stringify(this.trailerToEdit) !== JSON.stringify(this.originalTrailerData);
  }
 
  min(a: number, b: number): number {
    return Math.min(a, b);
  }
    searchTrailers() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredTrailers = [...this.allTrailers];
    } else {
      this.filteredTrailers = this.allTrailers.filter(trailer => {
        const unitNumber = (trailer.unitNumber || '').toLowerCase();
        const companyName = (this.findCompanyName(trailer.companyId) || '').toLowerCase();
        return unitNumber.includes(term) || companyName.includes(term);
      });
    }
    this.currentPage = 1;
  }
 
  }
