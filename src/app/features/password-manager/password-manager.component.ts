import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-password-manager',
  templateUrl: './password-manager.component.html',
  styleUrls: ['./password-manager.component.css']
})
export class PasswordManagerComponent implements OnInit {
  passwords: any[] = [];
  paginatedPasswords: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  companies: any[] = []; // Array to store fetched companies
  newUsers: any = {};
  selectedCompanyId: string = '';
  passwordForm: any = {
    companyName: '',
    organization: '',
    username: '',
    password: '',
    backupPhoneNumber: '',
    note: ''
  };

  isEditMode: boolean = false;
  editPasswordId: string | null = null;
  passwordIdToDelete: string | null = null;
  isSidebarOpen: boolean = false;
  searchQuery: string = '';

  constructor(private authService: ServiceAuthService, private toastr: ToastrService, private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.getAllPasswords();
    this.loadCompany();
    // this.loadCompany(); // Fetch companies on initialization
  }

  // Fetch all passwords
  getAllPasswords(): void {
    this.authService.getPasswords().subscribe(
      (response: any) => {
        this.passwords = response;
        this.totalItems = this.passwords.length;
        this.updatePaginatedPasswords();
      },
      (error) => {
        console.error('Error fetching passwords:', error);
        this.toastr.error('Failed to fetch passwords.', 'Error');
      }
    );
  }

  loadCompany() {
    this.authService.getAllCompanies().subscribe(
      (data: any) => {
        console.log('Fetched companies:', data);
        this.companies = data;
        console.log('Populated companies array:', this.companies);
        this.cdr.detectChanges(); // only needed if using OnPush strategy
      },
      (error) => {
        console.error('Error loading companies:', error);
        this.toastr.error('Failed to load companies.', 'Error');
      }
    );
  }

  // Submit form for adding or updating a password
  submitForm(): void {
    if (!this.selectedCompanyId) {
        this.toastr.error('Please select a company.', 'Validation Error');
        return;
    }

    // Set the selected company name in the form
    const selectedCompany = this.companies.find(company => company._id === this.selectedCompanyId);
    if (selectedCompany) {
        this.passwordForm.companyName = selectedCompany.companyName;
    } else {
        this.toastr.error('Invalid company selected.', 'Validation Error');
        return;
    }

    if (this.isEditMode && this.editPasswordId) {
        this.authService.updatePassword(this.editPasswordId, this.passwordForm).subscribe(
            (response: any) => {
                this.toastr.success('Password updated successfully!', 'Success');
                this.getAllPasswords();
                this.resetForm();
            },
            (error) => {
                console.error('Error updating password:', error);
                this.toastr.error('Failed to update password.', 'Error');
            }
        );
    } else {
        this.authService.createPassword(this.passwordForm).subscribe(
            (response: any) => {
                this.toastr.success('Password added successfully!', 'Success');
                this.getAllPasswords();
                this.resetForm();
            },
            (error) => {
                console.error('Error adding password:', error);
                this.toastr.error('Failed to add password.', 'Error');
            }
        );
    }
  }

  // Delete a password
  deletePassword(passwordId: string): void {
    this.authService.deletePassword(passwordId).subscribe(
      (response: any) => {
        this.toastr.success('Password deleted successfully!', 'Success');
        this.getAllPasswords();
        this.passwordIdToDelete = null;
      },
      (error) => {
        console.error('Error deleting password:', error);
        this.toastr.error('Failed to delete password.', 'Error');
      }
    );
  }

  // Initialize form for editing
  editPassword(password: any): void {
    this.isEditMode = true;
    this.editPasswordId = password._id;
    this.passwordForm = {
        companyName: password.companyName || '',
        organization: password.organization || '',
        username: password.username || '',
        password: password.password || '',
        backupPhoneNumber: password.backupPhoneNumber || '',
        note: password.note || ''
    };
    // Ensure the modal is opened programmatically if needed
    const editModal = document.getElementById('ExtralargeModalEdit');
    if (editModal) {
        editModal.classList.add('show');
        editModal.style.display = 'block';
    }
  }

  // Reset form
  resetForm(): void {
    this.isEditMode = false;
    this.editPasswordId = null;
    this.passwordForm = {
      companyName: '',
      organization: '',
      username: '',
      password: '',
      backupPhoneNumber: '',
      note: ''
    };
  }

  // Pagination methods
  updatePaginatedPasswords(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedPasswords = this.passwords.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.updatePaginatedPasswords();
    }
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  setPasswordToDelete(passwordId: string): void {
    this.passwordIdToDelete = passwordId;
  }
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  searchPasswords() {
    const query = this.searchQuery.toLowerCase();
    this.paginatedPasswords = this.passwords.filter(password =>
      password.companyName.toLowerCase().includes(query) ||
      password.organization.toLowerCase().includes(query)
    );
  }

}


