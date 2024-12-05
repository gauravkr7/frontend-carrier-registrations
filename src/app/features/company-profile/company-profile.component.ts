import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpHeaders } from '@angular/common/http';

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
  companyId: string = '';
  companyData: any;
  showBackToDashboard: boolean = false;
  getDot: any;
  companyToEdit: any = {};
  originalcompanyData: any = {};
  newDotData: any;
  private dotTimeout: any = null;


  constructor(
    private authService: ServiceAuthService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id') || '';
    this.fetchCounts();
    this.checkUserRole();
    if (this.companyId) {
      this.loadCompanyData(this.companyId);
    }
  }


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

  checkUserRole(): void {
    const usertype = this.authService.getUserType();
    this.showBackToDashboard = usertype === 'superadmin';
  }

 
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

  fetchDotData(dot: string): void {
    if (!dot) {
      console.error('DOT number is missing.');
      return;
    }
    this.authService.getByDotnumber(dot).subscribe(
      (getDot: any) => {
        this.getDot = getDot;
        this.cdr.detectChanges();
      },
      (error: any) => {
        // console.error('Error fetching DOT data:', error);
      }
    );
  }

  editcompany(company: any): void {
    this.companyToEdit = { ...company };
    this.originalcompanyData = { ...company };
  }

  companyEditFile(event: any, key: string): void {
    const file = event.target.files[0];
    if (file) {
      this.companyToEdit[key] = file;
    }
  }


  hasChanges(): boolean {
    return JSON.stringify(this.companyToEdit) !== JSON.stringify(this.originalcompanyData);
  }

  updateCompanyProfile(): void {
    if (!this.hasChanges()) {
      this.toastr.error('No changes detected. Please modify the company details before saving.', 'Error');
      return;
    }

    const formData = new FormData();
    Object.keys(this.companyToEdit).forEach(key => {
      formData.append(key, this.companyToEdit[key]);
    });

    this.authService.updateCompanyProfile(this.companyToEdit._id, formData).subscribe(
      (response: any) => {
        // console.log('Company updated successfully:', response);
        this.toastr.success('Company updated successfully!', 'Success');
        this.loadCompanyData(this.companyToEdit._id); 
        this.companyToEdit = {};
        this.originalcompanyData = {}; 
      },
      (error: any) => {
        // console.error('Error updating company:', error);
        this.toastr.error('Failed to update company.', 'Error');
      }
    );
  }

  onDotChange(dot: string) {
    if (dot.includes('.')) {
      this.companyToEdit.dot = dot.replace(/\./g, '');
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
    const token = this.authService.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization',` Bearer ${token}`);
    this.authService.createDotCompany(companyData).subscribe((response: any) => {
      // console.log('DOT company created successfully:', response);

      if (
        response &&
        response.dot &&
        response.dot.data &&
        response.dot.data.dotData &&
        response.dot.data.dotData.record &&
        response.dot.data.mcData &&
        response.dot.data.mcData.record
      ) {
        const carrier = response.dot.data.dotData.record.content.carrier;
        const mcNumbers = response.dot.data.mcData.record.content[0];

        // Check if the carrier data exists
        if (carrier) {
          this.populateCompanyFields(carrier);
          this.populateMcNumbers(mcNumbers);
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
      this.companyToEdit.legalName = carrier.legalName || '';
      this.companyToEdit.dotNumber = carrier.dotNumber || '';
      this.companyToEdit.ein = carrier.ein || '';
      this.companyToEdit.phyStreet = carrier.phyStreet || '';
      this.companyToEdit.phyCountry = carrier.phyCountry || '';
      this.companyToEdit.phyCity = carrier.phyCity || '';
      this.companyToEdit.phyState = carrier.phyState || '';
      this.companyToEdit.phyZipcode = carrier.phyZipcode || '';
      this.companyToEdit.Allowtooperator = carrier.allowedToOperate || '';
      this.companyToEdit.BiptoInsurance = carrier.bipdInsuranceRequired || '';
      this.companyToEdit.CompanyDBA = carrier.dbaName || 'N/A';
      this.companyToEdit.Broker = carrier.brokerAuthorityStatus || 'N';
      this.companyToEdit.Common = carrier.commonAuthorityStatus || 'N';
      this.companyToEdit.Contract = carrier.contractAuthorityStatus || 'N';
      this.companyToEdit.DotStatus = carrier.statusCode || 'N';
      this.companyToEdit.Vehicle = carrier.vehicleOosRateNationalAverage || 'N';
      this.companyToEdit.Driver = carrier.driverOosRateNationalAverage || 'N';
      this.companyToEdit.Hazmat = carrier.hazmatOosRateNationalAverage || 'N';
      this.companyToEdit.companyName = this.companyToEdit.legalName;
      this.cdr.detectChanges();
    } else {
      this.toastr.error('Carrier data is not available.');
    }
  }
  populateMcNumbers(mcNumbers: any) {
    console.log('MC Numbers:', mcNumbers);

    if (mcNumbers) {
        this.companyToEdit.mc = mcNumbers.docketNumber || '';
        this.cdr.detectChanges();
    } else {
        this.toastr.error('No MC numbers available in the response.');
    }
}
}
