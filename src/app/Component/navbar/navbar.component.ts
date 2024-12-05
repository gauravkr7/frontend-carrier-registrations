import { Injectable, Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  private selectedCompanySubject = new BehaviorSubject<any>(null);
  selectedCompany$ = this.selectedCompanySubject.asObservable();

  setSelectedCompany(company: any) {
    this.selectedCompanySubject.next(company);
  }
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  selectedCompany: any = null;
  companies: any[] = []; 
  name: string = '';

  constructor(
    private router: Router,
    private serviceAuthService: ServiceAuthService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private companyService: CompanyService 
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.name = localStorage.getItem('name') || 'Guest';

    this.companyService.selectedCompany$.subscribe(company => {
      this.selectedCompany = company;
    });

    // Check for route params
    this.route.params.subscribe(params => {
      const companyId = params['id'];
      if (companyId) {
        this.getCompanyById(companyId);
      } else {
      }
    });
  }

  loadCompanies() {
    this.serviceAuthService.getAllCompanies().subscribe(
      (data: any) => {
        this.companies = data;
      },
      error => {
        console.error('Error loading companies:', error);
      }
    );
  }

  getCompanyById(id: string) {
    this.serviceAuthService.getCompanyById(id).subscribe(
      (data: any) => {
        this.selectedCompany = data; 
        this.companyService.setSelectedCompany(data); 
        this.toastr.success('Company details loaded!');
      },
      error => {
        console.error('Error loading company by ID:', error);
      }
    );
  }

  goToCompanyProfile() {
    if (this.selectedCompany && this.selectedCompany._id) {
      this.router.navigate(['/company-profile', this.selectedCompany._id]);
    } else {
      console.error('No selected company available to navigate to.');
    }
  }
}
