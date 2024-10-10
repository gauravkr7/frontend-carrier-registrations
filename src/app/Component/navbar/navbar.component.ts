import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  selectedCompany: any = null; // Store the selected company
  companies: any[] = []; // Store the list of companies
  name : string ='';
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  companyData: any;
  companyId: string = '';
  

  constructor(
    private router: Router,
    private serviceAuthService: ServiceAuthService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private activatedRoute: ActivatedRoute

  ) { }

  ngOnInit(): void {
    this.companyId = this.activatedRoute.snapshot.paramMap.get('id') || '';
    if (this.companyId) {
      this.loadcompanyData(this.companyId);
    }
    this.loadCompanies();
this.name = localStorage.getItem('name') || 'Guest';
    // Check if a company ID is passed via route params
    this.route.params.subscribe(params => {
      const companyId = params['id'];
      if (companyId) {
        this.getCompanyById(companyId); 
      } else {
        this.selectedCompany = JSON.parse(localStorage.getItem('selectedCompany') || 'null');
      }
    });
  }
  loadcompanyData(id: string): void {
    if (!id) {
      console.error('ID is undefined or null');
      return;
    }
    console.log('Loading company data for ID:', id);
    this.serviceAuthService.getCompanyById(id).subscribe(
      (data: any) => {
        console.log('Company Data:', data);
        this.companyData = data;
      },
      (error: any) => {
        console.error('Error loading company data:', error);
      }
    );
  }

  loadCompanies() {
    this.serviceAuthService.getAllCompanies().subscribe((data: any) => {
      this.companies = data; 
    }, error => {
      console.error('Error loading companies:', error);
      // this.toastr.error('Failed to load companies.');
    });
  }

  getCompanyById(id: string) {
    this.serviceAuthService.getCompanyById(id).subscribe((data: any) => {
      this.selectedCompany = data; 
      localStorage.setItem('selectedCompany', JSON.stringify(data)); 
      this.toastr.success('Company details loaded!');
    }, error => {
      console.error('Error loading company by ID:', error);
      // this.toastr.error('Failed to load company details.');
    });
  }

  goToCompanyProfile() {
    if (this.selectedCompany && this.selectedCompany._id) {
      this.router.navigate(['/company-profile', this.selectedCompany._id]); 
    } else {
      console.error('No selected company available to navigate to.');
    }
  }
  
  
}