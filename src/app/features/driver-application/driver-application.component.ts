import { Component, OnInit, Renderer2 } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr'; // <-- Add this import

@Component({
  selector: 'app-driver-application',
  templateUrl: './driver-application.component.html',
  styleUrls: ['./driver-application.component.css']
})
export class DriverApplicationComponent implements OnInit {
  driverapplication: any[] = [];
  activeFilter: 'pending' | 'approved' | 'rejected' | 'all' = 'all';

  newDriverapplication: any = {
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phone: '',
    previousLicence: '',
    Address: '',
    status: 'Pending'
  };
  newDriver: any = {}; // Added this line
  filteredDriverapplication: any[] = [];
  loadDriverapplication: any;

  driverApplicationsForm: any[] = [];
  driverApplications: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;

  isSidebarOpen: boolean = false; // Default value

  driverApplicationToEdit: any = null;
  originalDriverApplicationData: any = null;
  driverApplicationIdToDelete: string | null = null;

  // Add filter state and counts
  filteredDriverApplicationsForm: any[] = [];
  pendingDriversCount: number = 0;
  approvedDriversCount: number = 0;
  rejectedDriversCount: number = 0;

  constructor(
    private renderer: Renderer2,
    private serviceAuthService: ServiceAuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService // <-- Inject ToastrService
  ) { }

  ngOnInit(): void {
    // Load driver applications from backend API on component init
    this.loadDriversForm();
    this.loadDrivers();
    this.setupOffcanvasClose();
  }

  loadDriversForm() {
    this.serviceAuthService.getAllDriverForms().subscribe((driverapplication: any) => {
      this.driverApplicationsForm = driverapplication;
      this.updateDriverCountsAndFilter();
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
      this.driverApplicationsForm = [];
      this.updateDriverCountsAndFilter();
    });
  }
  loadDrivers() {
    this.serviceAuthService.getDriverapplicationFromAPI().subscribe((driverapplication: any) => {
      // Show all driver applications (remove status filter for debugging)
      this.driverApplications = driverapplication;
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
      this.driverApplications = [];
    });
  }

  filterDriverapplication(filterType: string) {
    if (filterType === 'all') {
      this.filteredDriverapplication = this.driverapplication;
    } else if (filterType === 'nonCompliant') {
      this.filteredDriverapplication = this.driverapplication.filter(driverapplication => driverapplication.status === 'APPROVED');
    } else if (filterType === 'compliant') {
      this.filteredDriverapplication = this.driverapplication.filter(driverapplication => driverapplication.status === 'PENDING');
    } else if (filterType === 'expiring') {
      this.filteredDriverapplication = this.driverapplication.filter(driverapplication => driverapplication.status === 'EXPIRING');
    }
    this.cdr.detectChanges();
  }
  submitForm() {
    console.log('Submitting form...');
    console.log('New Driverapplication Data:', this.newDriverapplication);

    const now = new Date();
    const applicationDate = now.toISOString();
    const availabilityDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    const whenSent = now.toISOString(); // Add this for when the link was sent

    const newDriver = {
      ...this.newDriverapplication,
      id: Date.now(),
      status: 'SHORT_FORM_SENT',
      applicationDate,
      availabilityDate,
      OpenLink: {  // Add this object to track link information
        whenSent: whenSent,
        expiresAt: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      }
    };

    this.serviceAuthService.createDriverapplication(newDriver).subscribe(
      (response: any) => {
        this.toastr.success('Driver application added successfully!', 'Success');
        this.loadDriversForm();
        this.loadDrivers();
        this.resetForm();
      },
      error => {
        this.toastr.error('Failed to add driver application.', 'Error');
        console.error('Error creating driverapplication:', error);
      }
    );
  }
  resetForm() {
    throw new Error('Method not implemented.');
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }


  getFormattedWhenSent(driver: any): string {
    if (!driver?.OpenLink?.whenSent) return '';
    const date = new Date(driver.OpenLink.whenSent);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString();
  }

  getExpiryDate(driver: any): string {
    if (!driver?.OpenLink?.expiresAt) return '';
    const expiryDate = new Date(driver.OpenLink.expiresAt);
    if (isNaN(expiryDate.getTime())) return '';
    return expiryDate.toLocaleString();
  }


  setupOffcanvasClose() {
    this.renderer.listen('window', 'click', (e: Event) => {
      const target = e.target as HTMLElement;
      if (target) {
        const offcanvasElements = document.querySelectorAll('.offcanvas.show');
        offcanvasElements.forEach((offcanvas) => {
          if (!offcanvas.contains(target) && !target.closest('[data-bs-toggle="offcanvas"]')) {
            (offcanvas as any).classList.remove('show');
            document.body.classList.remove('offcanvas-open');
            // Manually trigger the click event on the offcanvas toggle button to reset its state
            const toggleButton = document.querySelector(`[data-bs-target="#${offcanvas.id}"]`);
            if (toggleButton) {
              (toggleButton as HTMLElement).click();
            }
          }
        });
      }
    });
  }

  editDriver(driver: any) {
    // Set the driver to edit and open the edit form (if needed)
    this.driverApplicationToEdit = { ...driver };
    this.newDriverapplication = { ...driver };
    this.toastr.info('Edit mode enabled for driver application.', 'Edit');
  }

  // Save the edited driver application to backend
  saveEditDriverApplication() {
    const driverId = this.driverApplicationToEdit.id || this.driverApplicationToEdit._id;
    if (!driverId) return;

    // Remove _id from payload if present (optional, depends on backend)
    const payload = { ...this.newDriverapplication };
    if (payload._id) delete payload._id;

    this.serviceAuthService.updateDriverApplication(driverId, payload)
      .subscribe(
        (response: any) => {
          this.toastr.success('Driver application updated successfully!', 'Success');
          this.loadDrivers();
          this.driverApplicationToEdit = null;
          this.newDriverapplication = {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phone: '',
            previousLicence: '',
            Address: '',
            status: 'Pending'
          };
        },
        (error) => {
          this.toastr.error('Failed to update driver application.', 'Error');
          console.error('Error updating driver application:', error);
        }
      );
  }

  deleteDriver(driver: any) {
    const driverId = driver.id || driver._id;
    if (!driverId) return;
    this.serviceAuthService.deleteDriverApplication(driverId).subscribe(
      (response: any) => {
        this.toastr.success('Driver application deleted successfully!', 'Success');
        this.loadDrivers();
        if (this.newDriverapplication.id === driverId || this.newDriverapplication._id === driverId) {
          this.newDriverapplication = {
            firstName: '',
            middleName: '',
            lastName: '',
            email: '',
            phone: '',
            previousLicence: '',
            Address: '',
            status: 'Pending'
          };
        }
      },
      (error) => {
        this.toastr.error('Failed to delete driver application.', 'Error');
        console.error('Error deleting driver application:', error);
      }
    );
  }
  deleteDriverForm(driver: any) {
  const driverId = driver.id || driver._id;
  if (!driverId) return;
  this.serviceAuthService.deleteDriverForm(driverId).subscribe(
    (response: any) => {
      this.toastr.success('Driver form deleted successfully!', 'Success');
      this.loadDriversForm();
    },
    (error) => {
      if (error?.error === "Driver not found") {
        this.toastr.error('Driver form not found.', 'Error');
      } else {
        this.toastr.error('Failed to delete driver form.', 'Error');
      }
      console.error('Error deleting driver form:', error);
    }
  );
}

  resendLink(driver: any) {
    // Implement resend logic (e.g., call backend/email service)
    // Example: this.emailService.resendDriverLink(driver.email);
  }



  editDriverApplication(driverApplication: any) {
    this.driverApplicationToEdit = { ...driverApplication };
    this.originalDriverApplicationData = { ...driverApplication };
  }

  deleteDriverApplication(id?: string) {
    if (id) {
      this.serviceAuthService.deleteDriverApplication(id).subscribe(
        (response: any) => {
          // Optionally use a notification service here
          this.loadDrivers();
          this.driverApplicationIdToDelete = null;
        },
        (error) => {
          console.error('Error deleting driver application:', error);
          // Optionally use a notification service here
        }
      );
    }
  }

  // Return formatted date and time for 'applicationDate', or empty string if not available
  getFormattedApplicationDate(driver: any): string {
    if (!driver?.applicationDate) return '';
    const date = new Date(driver.applicationDate);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString();
  }

  // Return formatted date and time for 'availabilityDate', or empty string if not available
  getFormattedAvailabilityDate(driver: any): string {
    if (!driver?.availabilityDate) return '';
    const date = new Date(driver.availabilityDate);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleString();
  }





  // Fix: Normalize status check for all possible values (including SHORT_FORM_SENT, LONG_FORM_SUBMITTED, etc.)
  // Treat only APPROVED and REJECTED as not pending, everything else is pending

  updateDriverCountsAndFilter() {
    this.pendingDriversCount = this.driverApplicationsForm.filter(d => {
      const status = (d.status || '').toString().trim().toUpperCase();
      return status !== 'APPROVED' && status !== 'REJECTED';
    }).length;
    this.approvedDriversCount = this.driverApplicationsForm.filter(d => (d.status || '').toString().trim().toUpperCase() === 'APPROVED').length;
    this.rejectedDriversCount = this.driverApplicationsForm.filter(d => (d.status || '').toString().trim().toUpperCase() === 'REJECTED').length;
    this.applyActiveFilter();
  }

  applyActiveFilter() {
    if (this.activeFilter === 'pending') {
      this.filteredDriverApplicationsForm = this.driverApplicationsForm.filter(d => {
        const status = (d.status || '').toString().trim().toUpperCase();
        return status !== 'APPROVED' && status !== 'REJECTED';
      });
    } else if (this.activeFilter === 'approved') {
      this.filteredDriverApplicationsForm = this.driverApplicationsForm.filter(d => (d.status || '').toString().trim().toUpperCase() === 'APPROVED');
    } else if (this.activeFilter === 'rejected') {
      this.filteredDriverApplicationsForm = this.driverApplicationsForm.filter(d => (d.status || '').toString().trim().toUpperCase() === 'REJECTED');
    } else if (this.activeFilter === 'all') {
      this.filteredDriverApplicationsForm = [...this.driverApplicationsForm];
    } else {
      this.filteredDriverApplicationsForm = [...this.driverApplicationsForm];
    }
    this.currentPage = 1;
    this.cdr.detectChanges();
  }
  filterDrivers(filter: 'pending' | 'approved' | 'rejected' | 'all') {
    this.activeFilter = filter;
    this.applyActiveFilter();
  }
  // Add this method to handle tab click and filtering

  // Update paginated getter to use filtered data
  get paginatedDriverApplicationsForm() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredDriverApplicationsForm.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredDriverApplicationsForm.length / this.itemsPerPage) || 1;
  }

  getPageNumbers(): number[] {
    const total = this.getTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  changePage(page: number) {
    if (page < 1 || page > this.getTotalPages()) return;
    this.currentPage = page;
  }

  approveDriver(driver: any) {
    driver.approvalStatus = 'approved';
    driver.status = 'approved'; // <-- lowercase
    this.toastr.success('Driver approved!', 'Success');
    this.serviceAuthService.updateDriverApplication(driver.id || driver._id, driver).subscribe();
  }

  rejectDriver(driver: any) {
    driver.approvalStatus = 'rejected';
    driver.status = 'rejected'; // <-- lowercase
    this.toastr.info('Driver rejected.', 'Rejected');
    this.serviceAuthService.updateDriverApplication(driver.id || driver._id, driver).subscribe();
  }



  // Update filterDrivers method to accept 'all'

}


