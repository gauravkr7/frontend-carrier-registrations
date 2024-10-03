import { Component, OnInit } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
import * as bootstrap from 'bootstrap'; // Import Bootstrap for Offcanvas

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'companyList';
  companyId: string | null = null;
  companies: any[] = [];
  users: any[] = [];
  newCompany: any = {};
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

  constructor(
    private serviceAuthService: ServiceAuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCompanyId();
    this.loadCompany();
    this.loadUsers();
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

  loadCompany() {
    this.serviceAuthService.getAllCompanies().subscribe((data: any) => {
      this.companies = data;
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

  openAddUserOffcanvas() {
    const offcanvasElement = document.getElementById('addUserOffcanvas');
    if (offcanvasElement) { // Check if the element is not null
      const offcanvas = new bootstrap.Offcanvas(offcanvasElement);
      offcanvas.show();
    } else {
      console.error('Offcanvas element not found');
    }
  }
  registerNewUser() {
    if (!this.newUser.name || !this.newUser.email || !this.newUser.password || !this.newUser.companyId) {
      this.toastr.error('Please fill all required fields.');
      return;
    }

    this.serviceAuthService.registerUser(this.newUser).subscribe((response: any) => {
      console.log('User registered successfully:', response);
      this.toastr.success('User registered successfully!');
      this.loadUsers();
      this.resetNewUser();
      this.showAddUserForm = false;
      this.closeAddUserOffcanvas(); // Close offcanvas after registration
    }, (error: any) => {
      console.error('Error registering user:', error);
      this.toastr.error('Error registering user.');
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

  closeAddUserOffcanvas() {
    const offcanvasElement = document.getElementById('addUserOffcanvas');
    if (offcanvasElement) { // Check if the element is not null
      const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
      if (offcanvas) {
        offcanvas.hide();
      }
    } else {
      console.error('Offcanvas element not found');
    }
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

  onFileChange(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      this.newCompany[key] = file;
    }
  }

  submitForm(form: NgForm) {
    if (form.invalid) {
      Object.keys(form.controls).forEach(field => {
        const control = form.control.get(field);
        if (control) {
          control.markAsTouched({ onlySelf: true });
        }
      });

      this.toastr.error('Please correct the highlighted fields before submitting.', 'Form Submission Error');
      return;
    }
    const formData = new FormData();
    Object.keys(this.newCompany).forEach(key => {
      formData.append(key, this.newCompany[key]);
    });

    this.serviceAuthService.createCompany(formData).subscribe((response: any) => {
      console.log('Company created successfully:', response);
      this.toastr.success('Company created successfully!');
      this.loadCompany();
      this.newCompany = {};
    }, (error: any) => {
      console.error('Error creating company:', error);
      this.toastr.error('Error creating company.');
    });
  }
}
