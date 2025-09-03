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
  returnUrl: string = '/dashboard';  // Default redirect

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
      // Query Params se returnUrl nikalna
      this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  loadcompanyData(id: string): void {
    if (!id) {
      console.error('ID is undefined or null');
      return;
    }
    // console.log('Loading company data for ID:', id);
    this.authService.getCompanyById(id).subscribe(
      (data: any) => {
        // console.log('Company Data:', data);
        this.companyData = data;
      },
      (error: any) => {
        console.error('Error loading company data:', error);
      }
    );
  }

login() {
  this.authService.login(this.email, this.password, this.rememberMe, this.name).subscribe({
    next: (response: any) => {
      // Clear old session data
      localStorage.clear();
      sessionStorage.clear();

      if (response && response.token) {
        // Store token
        localStorage.setItem('token', response.token);

        // Store user object (with id, name, role, email, companyId etc.)
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Store companyId separately for quick access if needed
        if (response.user?.companyId) {
          localStorage.setItem('companyId', response.user.companyId);
        }
      }

      // Get role from user
      const role = response.user?.role || response.role;

      // Redirect based on role
      if (role === 'superadmin') {
        this.toastr.success('Super Admin Login successful!', 'Success');
        this.router.navigateByUrl(this.returnUrl);
      } else if (['admin', 'superadminuser', 'adminuser'].includes(role)) {
        this.toastr.success('Login successful!', 'Success');

        const storedCompanyId = response.user?.companyId || localStorage.getItem('companyId');
        if (storedCompanyId) {
          this.router.navigateByUrl(this.returnUrl);
        } else {
          this.router.navigate(['/company-profile']);
        }
      } else {
        this.toastr.error('Unauthorized role', 'Error');
      }
    },
    error: (err) => {
      console.error(err);
      this.toastr.error('Login failed. Please try again.', 'Error');
    }
  });
}

}