import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';
import { response } from 'express';
import { log } from '@angular-devkit/build-angular/src/builders/ssr-dev-server';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  newUsers: any = {};
  userIdToDelete: string | null = null;
  userToEdit: any = {};
  originalUserData: any = {}; // Store original truck data for comparison
  selectedUserId: string = '';
  selectedUserName: string = '';
  userPermissions: any = {};
  permissionsCategories = ['truckList', 'trailerList', 'driverList', 'driverApplication', 'companyList'];
  permissionsActions = ['create', 'read', 'update', 'delete'];
  newUser: any = {
    name: '',
    email: '',
    role: '',
    companyId: '',
    password: '',
    permissions: {
      truckList: { create: true, read: true, update: false, delete: false },
      trailerList: { create: true, read: true, update: false, delete: false },
      driverList: { create: true, read: true, update: false, delete: false },
      driverApplication: { create: true, read: true, update: false, delete: false },
      companyList: { create: true, read: true, update: false, delete: false }
    }
  };
  companies: any[] = [];
  constructor(
    private serviceAuthService: ServiceAuthService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.getUsersFromAPI();
    this.loadCompany();


  }

  submitForm(): void {
    this.serviceAuthService.createUsers(this.newUsers)
      .subscribe((response: any) => {
        console.log('Password Updated successfully:', response);
        // this.toastr.success('Password updated successfully', 'Success');
        this.getUsersFromAPI();
        this.newUsers = {};
      }, error => {
        console.error('Error Password updated:', error);
        // this.toastr.error('Error updating password', 'Error');
      });
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
  registerNewUser(): void {
    this.serviceAuthService.registerUser(this.newUser)
      .subscribe((response: any) => {
        console.log('User registered successfully:', response);    
        this.getUsersFromAPI();
        this.newUser = {};
      }, error => {
        console.error('Error registering new user:', error);
      });
  }


   //New code
   isSidebarOpen: boolean = false; // Default value
 
   toggleSidebar() {
     this.isSidebarOpen = !this.isSidebarOpen;
   }  

   
  getUsersFromAPI() {
    this.serviceAuthService.getUsersFromAPI()
      .subscribe((response: any) => {
        if (response && Array.isArray(response.data)) {
          this.users = response.data; 
          this.cdr.detectChanges();
         
        } else if (Array.isArray(response)) {
          this.users = response; 
          this.cdr.detectChanges();
          
        } else {
          console.error('Invalid data format received from API:', response);
        
        }
      }, error => {
        console.error('Error fetching users:', error);
       
      });
  }
  
  openPermissions(userId: string): void {
    this.selectedUserId = userId;
    const selectedUser = this.users.find(user => user._id === userId);
    if (selectedUser) {
      this.selectedUserName = selectedUser.name;
      this.userPermissions = selectedUser.permissions || {};
    }
  }

  onPermissionChange(userId: string, category: string, action: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    if (!this.userPermissions[category]) {
      this.userPermissions[category] = {};
    }
    this.userPermissions[category][action] = checked;
  }

  savePermissions() {
    console.log('Saving permissions...');
    if (this.selectedUserId) {
      this.serviceAuthService.updateUserPermissions(this.selectedUserId, this.userPermissions)
        .subscribe((response: any) => {
          console.log('Permissions updated successfully for user:', this.selectedUserId, response);
          this.toastr.success('Permissions updated successfully', 'Success');
          this.getUsersFromAPI();
        }, error => {
          console.error('Error updating permissions for user:', this.selectedUserId, error);
          this.toastr.error('Error updating permissions', 'Error');
        });
    }
  }

  setuserToDelete(id: string) {
    this.userIdToDelete = id;
  }

  deleteUser(id?: string) {
    if (id) {
      this.serviceAuthService.deleteUsers(id).subscribe((response: any) => {
        console.log('User deleted successfully:', response);
        this.toastr.success('User deleted successfully!', 'Success');
        this.getUsersFromAPI();
        this.userIdToDelete = null;
      }, error => {
        console.error('Error deleting user:', error);
        this.toastr.error('Failed to delete user.', 'Error');
      });
    }
  }



  
  edituser(driver: any) {
    this.userToEdit = { ...driver }; 
    this.originalUserData = { ...driver }; // Save the original driver data for comparison
  }

  driverEditFile(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      this.userToEdit[key] = file;
    }
  }

  hasChanges(): boolean {
    // Compare original driver data with the current driverToEdit data
    return JSON.stringify(this.userToEdit) !== JSON.stringify(this.originalUserData);
  }

  updateUsers() {
    if (!this.hasChanges()) {
      this.toastr.error('No changes detected. Please modify the driver details before saving.', 'Error');
      return;
    }
  
    const formData = new FormData();
  
    Object.keys(this.userToEdit).forEach(key => {
      if (this.userToEdit[key] instanceof File) {
        // Append file fields correctly
        formData.append(key, this.userToEdit[key], this.userToEdit[key].name);
      } else {
        // Append non-file fields as strings
        formData.append(key, this.userToEdit[key]);
      }
    });
  
    this.serviceAuthService.updateUsers(this.userToEdit._id, formData).subscribe(
      (response: any) => {
        console.log('Driver updated successfully:', response);
        this.toastr.success('Driver updated successfully!', 'Success');
        this.getUsersFromAPI();
        this.userToEdit = {}; // Clear the form after successful update
      },
      (error) => {
        console.error('Error updating driver:', error);
        this.toastr.error('Failed to update driver.', 'Error');
      }
    );
  }
  

}