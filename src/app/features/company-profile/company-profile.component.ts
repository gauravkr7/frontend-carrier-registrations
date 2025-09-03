import { Component, OnInit, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpHeaders } from '@angular/common/http';
import { SharedUtilityService } from '../../shared/shared-utility.service';
import { formatDate } from '@angular/common';
import * as bootstrap from 'bootstrap';
import { ElementRef } from '@angular/core';
import { NgForm } from '@angular/forms';



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
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css']
})
export class CompanyProfileComponent implements OnInit {
  newContact: any = {};
  newNote: string = '';
  editingContactId: string | null = null;
  editingNoteId: string | null = null;


  totalTrucks: number = 0;
  totalTrailers: number = 0;
  totalDrivers: number = 0;
  nonCompliantTrucks: number = 0;
  compliantTrucks: number = 0;
  expiringTrucks: number = 0;
  nonCompliantTrailers: number = 0;
  compliantTrailers: number = 0;
  expiringTrailers: number = 0;
  nonCompliantDrivers: number = 0;
  compliantDrivers: number = 0;
  expiringDrivers: number = 0;
  companyId: string = '';
  companyData: any;
  showBackToDashboard: boolean = false;
  getDot: any;
  companyToEdit: any = {};
  originalcompanyData: any = {};
  newDotData: any;
  private dotTimeout: any = null;
  activeSection: string = 'company-info'; // Add this property
  selectedCompany: any = {}; // Add this property
 
  insurance: any = { // Add this property
    companyInsuranceName: '',
    policyNumber: '',
    policyStartDate: '',
    policyExpirationDate: '',
    insuranceuploadDocument: ''
    
  };
   notes: any[] = [];  
  insuranceRows: any[] = []; // Add this property
  selectedInsuranceType: string | null = null; // Add this property
  companyFileNames: { [key: string]: string } = {}; // Add this property
 
  activeTasks: any[] = []; // Add this line
  activityLogs: any[] = []; // also for your other badge
  
  constructor(
    private elRef: ElementRef,
     private serviceAuthService: ServiceAuthService,
    private authService: ServiceAuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private sharedUtilityService: SharedUtilityService,
    private renderer: Renderer2) { }
  

  ngOnInit(): void {
    this.loadUsersForCompany();
     this.loadAllTasks();
    this.loadAllNotes();
    this.loadCarrierContacts();
    this.activeTasks = [];
    this.companyId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchCounts();
    this.checkUserRole();
    this.loadCurrentUser(); // <-- Use this instead of direct assignment

    this.setupOffcanvasClose(); // Add this line
    if (this.companyId) {
      this.loadCompanyData(this.companyId);
    }
  }
  carrierContacts: any[] = [];
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
fetchCounts(): void {
  const companyId = this.selectedCrm?.companyId || this.selectedCrm?._id || this.companyId;
  if (!companyId) return;

  this.authService.getTrucksFromAPI().subscribe((trucks: any) => {
    const companyTrucks = trucks.filter((t: any) => t.companyId === companyId);
    this.totalTrucks = companyTrucks.length;
    this.animateCount(this.totalTrucks, 'totalTrucks');
    this.nonCompliantTrucks = companyTrucks.filter((t: any) => t.status === 'APPROVED').length;
    this.compliantTrucks = companyTrucks.filter((t: any) => t.status === 'PENDING').length;
    this.expiringTrucks = companyTrucks.filter((t: any) => t.status === 'EXPIRING').length;
    this.cdr.detectChanges();
  });

  this.authService.getTrailersFromAPI().subscribe((trailers: any) => {
    const companyTrailers = trailers.filter((t: any) => t.companyId === companyId);
    this.totalTrailers = companyTrailers.length;
    this.animateCount(this.totalTrailers, 'totalTrailers');
    this.nonCompliantTrailers = companyTrailers.filter((t: any) => t.status === 'APPROVED').length;
    this.compliantTrailers = companyTrailers.filter((t: any) => t.status === 'PENDING').length;
    this.expiringTrailers = companyTrailers.filter((t: any) => t.status === 'EXPIRING').length;
    this.cdr.detectChanges();
  });

  this.authService.getDriversFromAPI().subscribe((drivers: any) => {
    const companyDrivers = drivers.filter((d: any) => d.companyId === companyId);
    this.totalDrivers = companyDrivers.length;
    this.animateCount(this.totalDrivers, 'totalDrivers');
    this.nonCompliantDrivers = companyDrivers.filter((d: any) => d.status === 'APPROVED').length;
    this.compliantDrivers = companyDrivers.filter((d: any) => d.status === 'PENDING').length;
    this.expiringDrivers = companyDrivers.filter((d: any) => d.status === 'EXPIRING').length;
    this.cdr.detectChanges();
  });
}
  // Update the counts by filtering data by status
  updateCountsByStatus(data: any[], status: string, property: string): void {
    const filteredData = data.filter(item => item.status === status);
    const count = filteredData.length;
    (this as any)[property] = count;
    this.cdr.detectChanges();
  }

  // Animate the count for visual feedback
  animateCount(finalCount: number, property: string): void {
    let currentCount = 0;
    const increment = Math.ceil(finalCount / 100);
    const interval = setInterval(() => {
      if (currentCount < finalCount) {
        currentCount += increment;
        if (currentCount > finalCount) {
          currentCount = finalCount;
        }
        (this as any)[property] = currentCount;
      } else {
        clearInterval(interval);
      }
      this.cdr.detectChanges();
    }, 10);
  }

  checkUserRole(): void {
    const usertype = this.authService.getUserType();
    this.showBackToDashboard = usertype === 'superadmin';
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
loadAllTasks() {
  this.serviceAuthService.getAllTask().subscribe({
    next: (res: any) => {
      this.taskList = Array.isArray(res) ? res : [];
      // Filter active tasks for the selected company
      const id = this.selectedCrm?.companyId || this.selectedCrm?._id;
      this.activeTasks = this.taskList.filter(
        task => (task.completed === false || task.completed === 'false') && task.companyId === id
      );
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error loading tasks:', err);
    }
  });
}
closeCompletedTaskModal() {
  const modalEl = document.getElementById('taskModal1');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.hide();
  }
}
 loadCompanyData(id: string): void {
  if (!id) return;
  this.authService.getCompanyById(id).subscribe(
    (data: any) => {
      this.companyData = data;
      this.selectedCrm = data; // <-- Set selectedCrm
      this.fetchDotData(this.companyData.dot);
      this.loadActivityLogs();
      this.loadAllNotes();
      this.loadCarrierContacts();
      this.loadAllTasks();
    },
    (error: any) => {
      console.error('Error loading company data:', error);
    }
  );
}

  fetchDotData(dot: string): void {
    if (!dot) {
      console.error('DOT number is missing.');
      return;
    }
    this.authService.getByDotnumber(dot).subscribe(
      (getDot: any) => {
        this.getDot = getDot;
        this.cdr.detectChanges();
      },
      (error: any) => {
        // console.error('Error fetching DOT data:', error);
      }
    );
  }



  //New code
  isSidebarOpen: boolean = false; // Default value
 
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
 


  hasChanges(): boolean {
    return JSON.stringify(this.companyToEdit) !== JSON.stringify(this.originalcompanyData);
  }
  
  editcompany(companyData: any): void {
    this.companyToEdit = { ...companyData };
    this.activeSection = 'company-info';
  }



  onDotChange(dot: string) {
    if (dot.includes('.')) {
      this.companyToEdit.dot = dot.replace(/\./g, '');
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
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization',` Bearer ${token}`);
    this.authService.createDotCompany(companyData).subscribe((response: any) => {
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
      this.companyToEdit.legalName = carrier.legalName || '';
      this.companyToEdit.dotNumber = carrier.dotNumber || '';
      this.companyToEdit.ein = carrier.ein || '';
      this.companyToEdit.phyStreet = carrier.phyStreet || '';
      this.companyToEdit.phyCountry = carrier.phyCountry || '';
      this.companyToEdit.phyCity = carrier.phyCity || '';
      this.companyToEdit.phyState = carrier.phyState || '';
      this.companyToEdit.phyZipcode = carrier.phyZipcode || '';
      this.companyToEdit.Allowtooperator = carrier.allowedToOperate || '';
      this.companyToEdit.BiptoInsurance = carrier.bipdInsuranceRequired || '';
      this.companyToEdit.CompanyDBA = carrier.dbaName || 'N/A';
      this.companyToEdit.Broker = carrier.brokerAuthorityStatus || 'N';
      this.companyToEdit.Common = carrier.commonAuthorityStatus || 'N';
      this.companyToEdit.Contract = carrier.contractAuthorityStatus || 'N';
      this.companyToEdit.DotStatus = carrier.statusCode || 'N';
      this.companyToEdit.Vehicle = carrier.vehicleOosRateNationalAverage || 'N';
      this.companyToEdit.Driver = carrier.driverOosRateNationalAverage || 'N';
      this.companyToEdit.Hazmat = carrier.hazmatOosRateNationalAverage || 'N';
      this.companyToEdit.companyName = this.companyToEdit.legalName;
      this.cdr.detectChanges();
    } else {
      this.toastr.error('Carrier data is not available.');
    }
  }
  populateMcNumbers(mcNumbers: any) {
    console.log('MC Numbers:', mcNumbers);

    if (mcNumbers) {
        this.companyToEdit.mc = mcNumbers.docketNumber || '';
        this.cdr.detectChanges();
    } else {
        this.toastr.error('No MC numbers available in the response.');
        }
}

goToSection(section:"company-info" | "insurance-info" |"compliance-info"|"account-permits", event: Event) {
  event.stopPropagation();
  this.activeSection = section;
  document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
}


  deleteRow(index: number): void {
    this.insuranceRows.splice(index, 1);
  }

  onRowFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.insuranceRows[index].insuranceuploadDocument = file;
    }
  }

  onInsuranceTypeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedInsuranceType = target.value;
  }

  addRow(): void {
    this.insuranceRows.push({
      companyInsuranceName: '',
      policyNumber: '',
      policyStartDate: '',
      policyExpirationDate: '',
      insuranceuploadDocument: ''
    });
  }

  companyEditFile(event: any, key: string, index?: number): void {
    const file = event.target.files[0];
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  
    if (file) {
      if (allowedTypes.includes(file.type)) {
        if (index !== undefined) {
          // For array entries, append with index
          const fileKey = `insuranceDocument_${index}`;
          this.companyToEdit[fileKey] = file;
          this.companyFileNames[fileKey] = file.name; // Store file name
        } else {
          this.companyToEdit[key] = file;
          this.companyFileNames[key] = file.name; // Store file name
        }
      } else {
        this.toastr.error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.', 'Error');
      }
    }
  }

  updateCompanyProfile(): void {
    if (!this.hasChanges()) {
      this.toastr.error('No changes detected. Please modify the company details before saving.', 'Error');
      return;
    }
  
    const formData = new FormData();
  
    Object.keys(this.companyToEdit).forEach(key => {
      if (key === 'complianceDocuments' || key === 'accountsPermits' || key === 'insuranceDocuments') {
        formData.append(key, JSON.stringify(this.companyToEdit[key]));
      } else if (this.companyToEdit[key] instanceof File) {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(this.companyToEdit[key].type)) {
          formData.append(key, this.companyToEdit[key]);
        } else {
          this.toastr.error('Invalid file type. Only PDF, JPG, JPEG, and PNG files are allowed.', 'Error');
          return;
        }
      } else {
        formData.append(key, this.companyToEdit[key]);
      }
    });
  
    // Append insurance rows to formData
    this.insuranceRows.forEach((row, index) => {
      if (row.insuranceuploadDocument instanceof File) {
        formData.append(`insuranceuploadDocument_${index}`, row.insuranceuploadDocument);
        row.insuranceuploadDocument = `insuranceuploadDocument_${index}`;
      }
    });
    formData.append('insuranceRows', JSON.stringify(this.insuranceRows));
  
    this.authService.updateCompanyProfile(this.companyToEdit._id, formData).subscribe(
      (response: any) => {
        this.toastr.success('Company updated successfully!', 'Success');
        this.loadCompanyData(this.companyToEdit._id);
        this.companyToEdit = {};
        this.originalcompanyData = {};
      },
      (error: any) => {
        this.toastr.error('Failed to update company.', 'Error');
      }
    );
  }


setupOffcanvasClose() {
  this.sharedUtilityService.setupOffcanvasClose(this.renderer);
}

 activeTab: string = 'activity';   // default tab
  showAddButton: boolean = false;   // default hidden

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

  onTabChange(tab: string) {
    this.activeTab = tab;
    if (tab === 'users') this.showAddUserForm = false;

    // Show button only for Task and Carrier Contact
    this.showAddButton = ['tasks', 'c-contact'].includes(tab);
  }

  setActiveTab(tabName: string) {
    this.activeTab = tabName;
    if (tabName === 'users') this.showAddUserForm = false;

    this.showAddButton = (tabName === 'tasks' || tabName === 'c-contact');
  }

getInputPlaceholder(): string {
  return `Enter ${this.getButtonLabel()} Title`;
}


//  showAddUserForm: boolean = false;
// setActiveTab(tabName: string) {
//   this.activeTab = tabName;

//   if (tabName === 'users') {
//     this.showAddUserForm = false;
//   }

//   if (tabName === 'tasks' || tabName === 'c-contact') {
//     this.showAddButton = true;
//   } else {
//     this.showAddButton = false;
//   }
// }

  

  isLoadingActivity = false; // loading state
  activityForm = { details: '', outcome: '' }; // form fields
  selectedCrm: any; // currently selected company
  currentUser: any; // current logged-in user



  logActivity() {
    if (!this.selectedCrm || !this.selectedCrm._id) {
      this.toastr.error('No company selected.');
      return;
    }

    // Commented out validation allows submitting without filling outcome/details
    // if (!this.activityForm.details || !this.activityForm.outcome) {
    //   this.toastr.warning('Please fill all fields.');
    //   return;
    // }

    const payload = {
      companyId: this.selectedCrm._id,
      type: this.selectedActivityType,
      details: this.activityForm.details || '', // default empty string
      outcome: this.activityForm.outcome || '', // default empty string
      createdAt: new Date(),
      createdBy: this.currentUser?._id || 'unknown',
      createdByName: this.currentUser?.name || 'Unknown User',
    };

    this.isLoadingActivity = true;

    this.serviceAuthService.createActivity(payload).subscribe({
      next: () => {
        this.toastr.success('Activity logged!');
        this.activityForm.details = '';
        this.activityForm.outcome = '';
        this.loadActivityLogs(); // reload logs
        this.isLoadingActivity = false;
      },
      error: () => {
        this.toastr.error('Failed to log activity.');
        this.isLoadingActivity = false;
      },
    });
  }

  loadActivityLogs() {
    if (!this.selectedCrm || !this.selectedCrm._id) return;

    this.isLoadingActivity = true;

    this.serviceAuthService.getAllActivity().subscribe({
      next: (logs: any) => {
        this.activityLogs = Array.isArray(logs)
          ? logs.filter((log) => log.companyId === this.selectedCrm._id)
          : [];
        this.isLoadingActivity = false;
      },
      error: () => {
        this.activityLogs = [];
        this.isLoadingActivity = false;
      },
    });
  }
  editingTask: any = null;

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
closeTaskModal() {
  const modalEl = document.getElementById('taskModal2');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modal.hide();
  }
}



activityTypes = [
  { label: 'All Activity', value: 'all', icon: 'fa-list', color: 'secondary' },
  { label: 'Call', value: 'call', icon: 'fa-phone', color: 'primary' },
  { label: 'Email', value: 'email', icon: 'fa-envelope', color: 'danger' },
  { label: 'Text', value: 'text', icon: 'fa-sms', color: 'info' },
  { label: 'Meeting', value: 'meeting', icon: 'fa-calendar-alt', color: 'info' },
  { label: 'Note', value: 'note', icon: 'fa-sticky-note', color: 'info' }
];

selectedActivityType = 'all';

superAdminUsers: any[] = [];
filteredSuperAdminUsers: any[] = [];


get filteredActivityLogs() {
  let logs = this.activityLogs;

  if (this.selectedActivityType !== 'all') {
    logs = logs.filter(log => log.type === this.selectedActivityType);
  }

  // 🔹 latest first (createdAt ke hisaab se sort)
  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}


// Call this when the tab changes
onActivityTypeChange(type: string) {
  this.selectedActivityType = type;
}
trackByLogId(index: number, log: any) {
  return log._id || index;
}
selectedTab: 'active' | 'completed' = 'active';

taskList: any[] = [];
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

    openTaskModal(task: any) {
      this.selectedTask = task;
  
      const modalEl = this.elRef.nativeElement.querySelector('#taskModal1');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
selectedTask: any;

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
viewCrmDetails(company: any) {
  this.selectedCrm = company;
  this.loadActivityLogs();
  this.loadAllNotes();
   this.loadAllNotes();

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
isLoadingNotes: boolean = false;
// ✅ Load All Notes (call on init & after add/delete/update)
loadAllNotes() {
  if (!this.selectedCrm || (!this.selectedCrm._id && !this.selectedCrm.companyId)) return;
  this.isLoadingNotes = true;
  const id1 = String(this.selectedCrm._id || '');
  const id2 = String(this.selectedCrm.companyId || '');
  this.serviceAuthService.getAllNotes().subscribe(
    (notes: any) => {
      this.notes = Array.isArray(notes)
        ? notes.filter(note => String(note.companyId) === id1 || String(note.companyId) === id2)
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
autoResize(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto'; // reset first
  textarea.style.height = textarea.scrollHeight + 'px'; // set to content height
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
    // Add Carrier Contact (from crm.component.ts)
  addCarrierContact(form: NgForm) {
    if (!form.valid) {
      this.toastr.warning('Please fill required fields.');
      return;
    }
    // Attach companyId from selected company
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
    this.serviceAuthService.createCarrierContact(contactEntry).subscribe({
      next: () => {
        this.toastr.success('Contact added successfully!');
        form.resetForm();
        this.newContact = {};
        this.loadCarrierContacts();
        // Optionally close modal if you use one
      },
      error: () => {
        this.toastr.error('Failed to add contact.');
      }
    });
  }

  // Add Note (from crm.component.ts)
  submitNote(form: NgForm) {
    if (!form.valid) {
      this.toastr.warning('Please write a note before saving.');
      return;
    }
    const noteEntry: any = {
      note: this.newNote,
      companyId: this.selectedCrm?.companyId || this.selectedCrm?._id,
      createdBy: this.currentUser?.name || 'Unknown User',
      createdAt: new Date()
    };
    if (!noteEntry.companyId) {
      this.toastr.error('No company selected. Please open a company profile before adding a note.');
      return;
    }
    this.serviceAuthService.createNote(noteEntry).subscribe({
      next: () => {
        this.toastr.success('Note added successfully!');
        form.resetForm();
        this.newNote = '';
        this.loadAllNotes();
      },
      error: () => {
        this.toastr.error('Failed to add note.');
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
      this.currentUser = {
        _id: '',
        name: 'Unknown User',
        role: '',
        email: '',
        companyId: null
      };
    }
  }
openTaskDetails(task: any) {
  this.selectedTask = task;
    const modalEl =  this.elRef.nativeElement.querySelector('#taskDetailsModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  
}

}