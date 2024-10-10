import { Component, OnInit } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { NgForm } from '@angular/forms';
 import * as bootstrap from 'bootstrap'; 
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router'; 


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
  selectedCompany: any = {};
  private dotTimeout: any = null; 



  constructor(
    private serviceAuthService: ServiceAuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private route: ActivatedRoute 

  ) {}

  ngOnInit(): void {
    this.loadCompanyId();
    this.loadCompany();
    this.loadUsers();
    this.route.params.subscribe(params => {
      const companyId = params['id'];
      if (companyId) {
        this.getCompanyById(companyId); 
      }
    });

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

    if (this.newCompany.dot) {
      clearTimeout(this.dotTimeout);
      this.dotTimeout = setTimeout(() => {
        this.createDotCompany({ dot: this.newCompany.dot });
      }, 5000); // 10 seconds delay for DOT creation
    }
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
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.serviceAuthService.createDotCompany(companyData).subscribe((response: any) => {
      // console.log('DOT company created successfully:', response);
  
      // Check if the response structure is valid
      if (response && response.dot && response.dot.data && response.dot.data.record) {
        const carrier = response.dot.data.record.content.carrier;
  
        // Check if the carrier data exists
        if (carrier) {
          this.populateCompanyFields(carrier);
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
      this.newCompany.totalDrivers = carrier.totalDrivers || '';
      this.newCompany.totalPowerUnits = carrier.totalPowerUnits || '';
      this.newCompany.address = `${carrier.phyStreet || ''}, ${carrier.phyCity || ''}, ${carrier.phyState || ''}, ${carrier.phyZipcode || ''}`;
      this.newCompany.allowedToOperate = carrier.allowedToOperate || '';
      this.newCompany.bipdInsuranceOnFile = carrier.bipdInsuranceOnFile || '';
      this.newCompany.safetyRating = carrier.safetyRating || 'N/A';
      this.newCompany.brokerAuthorityStatus = carrier.brokerAuthorityStatus || 'N';
      this.newCompany.companyName = this.newCompany.legalName;
      this.cdr.detectChanges();
    } else {
      this.toastr.error('Carrier data is not available.');
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

}



  


  
