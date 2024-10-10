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
  name : string ='';
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  companyData: any;
  companyId: string = '';

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
    this.authService.login(this.email, this.password, this.rememberMe , this.name)
      .subscribe(response => {
        console.log(response);
  
        // Store company ID in local storage if it exists
        if (response.companyId) {
          localStorage.setItem('companyId', response.companyId);
        }
  
        if (response.role === 'superadmin' || this.email === 'superadmin@example.com') {
          this.toastr.success('Super Admin Login successful!', 'Success');
          this.router.navigate(['/dashboard']); // Redirect to dashboard for superadmin
        } else if (response.role === 'admin' || response.role === 'superadminuser' || response.role === 'adminuser') {
          this.toastr.success('Login successful!', 'Success');
          
          // Get the stored company ID from local storage
          const storedCompanyId = localStorage.getItem('companyId');
          
          // Check if the company ID exists and navigate accordingly
          if (storedCompanyId) {
            this.router.navigate(['/company-profile', storedCompanyId]); // Navigate to company profile with ID
          } else {
            this.router.navigate(['/company-profile']); // Navigate to company profile without ID
          }
        } else {
          this.toastr.error('Unauthorized role', 'Error');
        }
  
      }, error => {
        console.error(error);
        this.toastr.error('Login failed. Please try again.', 'Error');
      });
  }
  
}