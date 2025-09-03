import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceAuthService } from '../../service/service-auth.service';
 
interface CompanyDocument {
  id: string;
  documentName: string;
  policyExpirationDate?: Date;
  insuranceType?: string;
  complianceType?: string;
  expirationDate?: Date;
  insuranceuploadDocument?: string;
  usDOTRegistrationUploadDocument?: string;
  mcCertificateUploadDocument?: string;
  iftaRegistrationUploadDocument?: string;
  companyInsuranceName?: string;
  // Add other document properties as needed
}
 
interface CompanyDetails {
  companyName: string;
  companyType: string;
  insuranceDocuments: CompanyDocument[];
  complianceDocuments: CompanyDocument[];
  kyuUploadDocument?: string;
  kyuExpiration?: Date;
  nyUploadDocument?: string;
  nyExpiration?: Date;
  w9UploadDocument?: string;
  irpRenewalDate?: Date;
  dot: string; // Add dot property
}
 
@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentComponent implements OnInit {
  companyId: string;
  complianceDocs: CompanyDocument[] = [];
  insuranceDocs: CompanyDocument[] = [];
  pagedComplianceDocs: CompanyDocument[] = [];
  pagedInsuranceDocs: CompanyDocument[] = [];
  companyDocuments: CompanyDocument[] = [];
  companyName = '';
  companyType = '';
  expirationDates: Date[] = [];
  kyuUploadDocument?: string;
  kyuExpiration?: Date;
  nyUploadDocument?: string;
  nyExpiration?: Date;
  w9UploadDocument?: string;
  showBackToDashboard = false;
  isLoading = true;
  errorMessage = '';
  isSidebarOpen: boolean = false; // Default value
  dot: string = ''; // Add dot property
  currentPage: number = 1;
  itemsPerPage: number = 10; // Updated itemsPerPage
  totalItems: number = 0; // Add totalItems
  totalPages: number = 1; // Initialize totalPages
  totalPagesArray: number[] = [];
 
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private serviceAuthService: ServiceAuthService
  ) {
    this.companyId = this.route.snapshot.paramMap.get('id') || '';
  }
 
  ngOnInit(): void {
    if (!this.companyId) {
      this.errorMessage = 'Invalid company ID';
      this.isLoading = false;
      return;
    }
 
    this.fetchCompanyDocuments(this.companyId);
    this.checkUserRole();
  }
 
  private fetchCompanyDocuments(companyId: string): void {
    this.serviceAuthService.getCompanyById(companyId).subscribe({
      next: (response: CompanyDetails) => {
        this.processCompanyResponse(response);
        this.isLoading = false;
        this.calculateTotalPages();
        this.loadPageData();
      },
      error: (error) => {
        console.error('Error fetching company documents:', error);
        this.errorMessage = 'Failed to load company documents';
        this.isLoading = false;
      }
    });
  }
 
  private processCompanyResponse(response: CompanyDetails): void {
    this.companyName = response.companyName;
    this.companyType = response.companyType;
    this.kyuUploadDocument = response.kyuUploadDocument;
    this.kyuExpiration = response.kyuExpiration;
    this.nyUploadDocument = response.nyUploadDocument;
    this.nyExpiration = response.nyExpiration;
    this.w9UploadDocument = response.w9UploadDocument;
    this.dot = response.dot; // Fetch dot value from response
   
    // Combine documents with safe array fallbacks
    this.complianceDocs = response.complianceDocuments || [];
    this.insuranceDocs = response.insuranceDocuments || [];
    this.companyDocuments = [...this.complianceDocs, ...this.insuranceDocs];
 
    // Filter out undefined expiration dates
    this.expirationDates = [
      response.kyuExpiration,
      response.nyExpiration,
      response.irpRenewalDate,
      ...this.insuranceDocs.map(doc => doc.policyExpirationDate)
    ].filter((date): date is Date => !!date);

    this.totalItems = this.companyDocuments.length; // Set totalItems
  }
 
  private checkUserRole(): void {
    const userType = this.serviceAuthService.getUserType();
    this.showBackToDashboard = userType === 'superadmin';
  }
 
  navigateToCompanyProfile(): void {
    if (this.companyId) {
      this.router.navigate(['/company-profile', this.companyId]);
    } else {
      console.error('Company ID is not available');
      this.errorMessage = 'Unable to navigate to company profile';
    }
  }
 
  viewDocument(url?: string) {
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('Document URL is not available');
    }
  }
 
  deleteDoc(type: 'compliance' | 'insurance', docType: string, doc: any) {
    if (type === 'compliance') {
      // Handle compliance doc deletion
      delete doc[`${docType}UploadDocument`];
    } else {
      // Handle insurance doc deletion
      const index = this.insuranceDocs.indexOf(doc);
      if (index > -1) {
        this.insuranceDocs.splice(index, 1);
      }
    }
  }
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
 
  getDocumentName(url: string): string {
    return decodeURIComponent(url.split('/').pop() || 'N/A');
  }

  editDocument(document: any) {
    // Implement the logic to edit the document
    console.log('Edit document:', document);
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadPageData();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) { // Use totalPages
      this.currentPage++;
      this.loadPageData();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.loadPageData();
  }

  loadPageData(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;

    this.pagedComplianceDocs = this.complianceDocs.slice(startIndex, endIndex);
    this.pagedInsuranceDocs = this.insuranceDocs.slice(startIndex, endIndex);
  }

  private calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage); // Use totalItems
    this.totalPagesArray = Array(this.totalPages).fill(0).map((x, i) => i + 1);
  }
}
