import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css']
})
export class CompanyProfileComponent implements OnInit {
  totalTrucks: number = 0;
  totalTrailers: number = 0;
  totalDrivers: number = 0;
  nonCompliantTrucks: number = 0;
  compliantTrucks: number = 0;
  expiringTrucks: number = 0;
  nonCompliantTrailers: number = 0;
  compliantTrailers: number = 0;
  expiringTrailers: number = 0;
  nonCompliantDrivers: number = 0;
  compliantDrivers: number = 0;
  expiringDrivers: number = 0;
  companyId: string = ''; // Initialize with default value
  companyData: any;
  showBackToDashboard: boolean = false;
  dotData: any;
  companyToEdit: any = {};
  originalcompanyData: any = {};
  private dotTimeout: any = null;
  newDotData: any;

  constructor(
    private authService: ServiceAuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get company ID from route parameters
    this.companyId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchCounts();
    this.checkUserRole();
    if (this.companyId) {
      this.loadCompanyData(this.companyId); // Pass the companyId here
    }
  }

  // Method to fetch counts for trucks, trailers, and drivers
  fetchCounts(): void {
    this.authService.getTrucksFromAPI().subscribe((trucks: any) => {
      this.totalTrucks = trucks.length;
      this.animateCount(this.totalTrucks, 'totalTrucks');

      this.updateCountsByStatus(trucks, 'APPROVED', 'nonCompliantTrucks');
      this.updateCountsByStatus(trucks, 'PENDING', 'compliantTrucks');
      this.updateCountsByStatus(trucks, 'EXPIRING', 'expiringTrucks');
    });

    this.authService.getTrailersFromAPI().subscribe((trailers: any) => {
      this.totalTrailers = trailers.length;
      this.animateCount(this.totalTrailers, 'totalTrailers');

      this.updateCountsByStatus(trailers, 'APPROVED', 'nonCompliantTrailers');
      this.updateCountsByStatus(trailers, 'PENDING', 'compliantTrailers');
      this.updateCountsByStatus(trailers, 'EXPIRING', 'expiringTrailers');
    });

    this.authService.getDriversFromAPI().subscribe((drivers: any) => {
      this.totalDrivers = drivers.length;
      this.animateCount(this.totalDrivers, 'totalDrivers');

      this.updateCountsByStatus(drivers, 'APPROVED', 'nonCompliantDrivers');
      this.updateCountsByStatus(drivers, 'PENDING', 'compliantDrivers');
      this.updateCountsByStatus(drivers, 'EXPIRING', 'expiringDrivers');
    });
  }

  // Update the counts by filtering data by status
  updateCountsByStatus(data: any[], status: string, property: string): void {
    const filteredData = data.filter(item => item.status === status);
    const count = filteredData.length;
    (this as any)[property] = count;
    this.cdr.detectChanges();
  }

  // Animate the count for visual feedback
  animateCount(finalCount: number, property: string): void {
    let currentCount = 0;
    const increment = Math.ceil(finalCount / 100);
    const interval = setInterval(() => {
      if (currentCount < finalCount) {
        currentCount += increment;
        if (currentCount > finalCount) {
          currentCount = finalCount;
        }
        (this as any)[property] = currentCount;
      } else {
        clearInterval(interval);
      }
      this.cdr.detectChanges();
    }, 10);
  }

  // Check if the logged-in user is a superadmin
  checkUserRole(): void {
    const usertype = this.authService.getUserType();
    this.showBackToDashboard = usertype === 'superadmin';
  }

  // Load company data by ID
  loadCompanyData(id: string): void {
    if (!id) {
      console.error('ID is undefined or null');
      return;
    }
    this.authService.getCompanyById(id).subscribe(
      (data: any) => {
        this.companyData = data;
        this.fetchDotData(this.companyData.dot);
      },
      (error: any) => {
        console.error('Error loading company data:', error);
      }
    );
  }

  // Fetch DOT data based on company DOT number
  fetchDotData(dot: string): void {
    if (!dot) {
      console.error('DOT number is missing.');
      return;
    }
    this.authService.getByDotnumber(dot).subscribe(
      (dotData: any) => {
        this.dotData = dotData;
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error fetching DOT data:', error);
      }
    );
  }

  // Prepare company for editing
  editcompany(company: any): void {
    this.companyToEdit = { ...company };
    this.originalcompanyData = { ...company };
  }

  // Handle file selection for company editing
  companyEditFile(event: any, key: string): void {
    const file = event.target.files[0];
    if (file) {
      this.companyToEdit[key] = file;
    }
  }

  // Check if changes have been made to the company details
  hasChanges(): boolean {
    return JSON.stringify(this.companyToEdit) !== JSON.stringify(this.originalcompanyData);
  }

  // Update the company profile with the edited data
  updateCompanyProfile(): void {
    if (!this.hasChanges()) {
      this.toastr.error('No changes detected. Please modify the company details before saving.', 'Error');
      return;
    }

    // Create FormData object and append the edited data
    const formData = new FormData();
    Object.keys(this.companyToEdit).forEach(key => {
      formData.append(key, this.companyToEdit[key]);
    });

    // Proceed with update logic
    this.authService.updateCompanyProfile(this.companyToEdit._id, formData).subscribe(
      (response: any) => {
        console.log('Company updated successfully:', response);
        this.toastr.success('Company updated successfully!', 'Success');
        this.loadCompanyData(this.companyToEdit._id); // Pass company ID to reload the updated data
        this.companyToEdit = {};
        this.originalcompanyData = {}; // Clear original data after successful update
      },
      (error: any) => {
        console.error('Error updating company:', error);
        this.toastr.error('Failed to update company.', 'Error');
      }
    );
  }
onDotInputClick(): void {
  if (this.dotTimeout) {
    clearTimeout(this.dotTimeout);
  }

  this.dotTimeout = setTimeout(() => {
    if (this.companyToEdit.dot) {

      const dotData = {
        dot: this.companyToEdit.dot,
      };

      this.authService.createDotCompany(dotData).subscribe(
        (response: any) => {
          console.log('DOT created successfully:', response);
          this.newDotData = response;
        },
        (error: any) => {
          console.error('Error creating DOT:', error);
          // this.toastr.error('Failed to create DOT.', 'Error');
        }
      );
    } else {
      // this.toastr.error('Please enter a DOT number to create.', 'Error');
    }
  }, 5000); 
  }
}