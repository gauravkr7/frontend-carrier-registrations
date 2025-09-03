import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ServiceAuthService } from '../../service/service-auth.service';
import { SharedUtilityService } from '../../shared/shared-utility.service';
declare var bootstrap: any; // Ensure Bootstrap is available

@Component({
  selector: 'app-servicess',
  templateUrl: './servicess.component.html',
  styleUrls: ['./servicess.component.css']
})
export class ServicessComponent implements OnInit, AfterViewInit {
  
  @ViewChild('editServiceOffcanvas') editServiceOffcanvas!: ElementRef;
  services: any[] = [];
  accountingData: any[] = []; // Add this property to store accounting data
  filteredAccountingData: any[] = [];
  serviceForm: FormGroup;
  isSidebarOpen = false;
  isEditMode = false;
  currentServiceId: number | null = null;
  private offcanvasInstance: any;
  fileError: string | null = null; // Add fileError property
  searchTerm: string = '';
  filteredServices: any[] | undefined;


  constructor(
    private fb: FormBuilder,
    private serviceService: ServiceAuthService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    // private router: Router,
    // private http: HttpClient,
    private sharedUtilityService: SharedUtilityService
    
  ) {
    this.serviceForm = this.fb.group({
      serviceName: ['', Validators.required],
      category: ['', Validators.required],
      unitType: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      accountType: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.setupOffcanvasClose();
    this.getAllServices();
    this.fetchAccountingData(); // Fetch accounting data
  }

  ngAfterViewInit(): void {
    if (this.editServiceOffcanvas) {
      this.offcanvasInstance = new bootstrap.Offcanvas(this.editServiceOffcanvas.nativeElement);
    }
  }

  getAllServices(): void {
    this.serviceService.getAllService().subscribe(
      (response: any) => {
        console.log('Fetched services:', response);
        this.services = response.data;
        this.filteredServices = [...this.services]; // Update filteredServices after fetching

      },
      (error) => {
        console.error('Error fetching services:', error);
        this.toastr.error('Failed to fetch services', 'Error');
      }
    );
  }
  fetchAccountingData(): void {
    this.serviceService.getAccountPermitFromAPI().subscribe(
      (response: any) => {
        console.log('Fetched accounting data:', response);
        this.accountingData = response;
        // Filter out accounts with type 'Expense'
        this.filteredAccountingData = this.accountingData.filter(account => account.type === 'Income');
      },
      (error) => {
        console.error('Error fetching accounting data:', error);
        this.toastr.error('Failed to fetch accounting data', 'Error');
      }
    );
  }

  addService(): void {
    if (this.serviceForm.invalid) {
      this.toastr.warning('Please fill all required fields');
      return;
    }

    this.serviceService.createService(this.serviceForm.value).subscribe(
      (response: any) => {
        this.services.push(response.data); // Dynamically add the new service to the table
        this.toastr.success('Service added successfully');
        this.serviceForm.reset();
        this.offcanvasInstance.hide(); // Close the offcanvas
      },
      () => {
        this.toastr.error('Failed to add service', 'Error');
      }
    );
  }

  editService(service: any): void {
    this.isEditMode = true;
    this.currentServiceId = service.id || service._id; // Ensure compatibility with both id and _id
    this.serviceForm.reset(); // Reset the form before patching values
    this.serviceForm.patchValue(service);

    // Re-initialize the Offcanvas instance to ensure it opens properly
    if (this.editServiceOffcanvas) {
      this.offcanvasInstance = new bootstrap.Offcanvas(this.editServiceOffcanvas.nativeElement);
      this.offcanvasInstance.show();
    }
  }

  updateService(): void {
    if (this.serviceForm.invalid || !this.currentServiceId) return;

    this.serviceService.updateService(this.currentServiceId, this.serviceForm.value).subscribe({
      next: () => {
        const index = this.services.findIndex(s => s.id === this.currentServiceId || s._id === this.currentServiceId);
        if (index !== -1) {
          this.services[index] = { ...this.services[index], ...this.serviceForm.value }; // Update the service in the table
        }
        this.toastr.success('Service updated successfully');
        this.serviceForm.reset();
      },
      error: () => this.toastr.error('Failed to update service', 'Error')
    });
  }

  deleteService(serviceId: string): void { // Change parameter type to string
    this.serviceService.deleteService(serviceId).subscribe(
      () => {
        // Ensure services have _id or id as a string
        this.services = this.services.filter(s => s._id !== serviceId); // Use _id if that's the property
        this.toastr.success('Service deleted successfully');
      },
      () => {
        this.toastr.error('Failed to delete service', 'Error');
      }
    );
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  onOffcanvasHidden(): void {
    this.serviceForm.reset(); // Reset the form when the offcanvas is hidden
    this.isEditMode = false;
    this.currentServiceId = null;
  }
  setupOffcanvasClose() {
    this.sharedUtilityService.setupOffcanvasClose(this.renderer);
  }
  getAccountDetails(accountId: string): string {
    const account = this.accountingData.find(acc => acc.accountId === accountId);
    return account ? `${account.accountName} (${account.accountId})` : accountId; // Return both accountName and accountId`
  }

  // Add file size and type validation for file uploads (if any file upload logic exists)
  onFileChange(event: Event, field: string): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.error('Only JPG, PNG, and PDF files are allowed', 'File Type Error');
        return;
      }
      // File size validation (10 MB = 10485760 bytes)
      if (file.size > 10485760) {
        this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
        input.value = '';
        return;
      }
      // Store the file as needed, e.g. this.selectedFiles[field] = file;
      this.fileError = null;
    } else {
      // this.selectedFiles[field] = null;
      this.fileError = 'No file selected';
    }
  }
    searchServices() {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.filteredServices = [...this.services];
    } else {
      this.filteredServices = this.services.filter(service => {
        const name = (service.serviceName || '').toLowerCase();
        const category = (service.category || '').toLowerCase();
        const unitType = (service.unitType || '').toLowerCase();
        return name.includes(term) || category.includes(term) || unitType.includes(term);
      });
    }
  }
}
