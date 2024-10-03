import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  companyData: any;
  companyId: string = ''; // Initialize with default value

  constructor(
    private authService: ServiceAuthService,
    private router: Router,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get the company ID from the route parameter
    this.companyId = this.activatedRoute.snapshot.paramMap.get('id') || '';
    if (this.companyId) {
      this.loadcompanyData(this.companyId);
    }
  }

  loadcompanyData(id: string): void {
    if (!id) {
      console.error('ID is undefined or null');
      return;
    }
    console.log('Loading company data for ID:', id);
    this.authService.getCompanyById(id).subscribe(
      (data: any) => {
        console.log('Company Data:', data);
        this.companyData = data;
      },
      (error: any) => {
        console.error('Error loading company data:', error);
      }
    );
  }

  login() {
    this.authService.login(this.email, this.password, this.rememberMe)
      .subscribe(response => {
        console.log(response);

        // Store company ID in local storage
        if (response.companyId) {
          localStorage.setItem('companyId', response.companyId);
        }

        if (response.role === 'superadmin' || this.email === 'superadmin@example.com') {
          this.toastr.success('Super Admin Login successful!', 'Success');
          this.router.navigate(['/dashboard']); // Redirect to dashboard for superadmin
        } else if (response.role === 'admin' || response.role === 'superadminuser') {
          this.toastr.success('Login successful!', 'Success');
          const storedCompanyId = localStorage.getItem('companyId');
          this.router.navigate(['/company-profile', storedCompanyId]); // Redirect to company profile for admin or users
        } else {
          this.toastr.error('Unauthorized role', 'Error');
        }

      }, error => {
        console.error(error);
        this.toastr.error('Login failed. Please try again.', 'Error');
      });
  }
}
