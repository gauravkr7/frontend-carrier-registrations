import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ActivatedRoute } from '@angular/router';
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

  constructor(
    private authService: ServiceAuthService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute // Inject ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id') || ''; // Get the company ID from route parameters
    this.fetchCounts();
    this.checkUserRole();
    if (this.companyId) {
      this.loadcompanyData(this.companyId);
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

  updateCountsByStatus(data: any[], status: string, property: string): void {
    const filteredData = data.filter(item => item.status === status);
    const count = filteredData.length;
    (this as any)[property] = count;
    this.cdr.detectChanges();
  }

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

  loadcompanyData(id: string): void {
    if (!id) {
      console.error('ID is undefined or null');
      return;
    }
    console.log('Loading company data for ID:', id);
    this.authService.getCompanyById(id).subscribe(
      (data: any) => { // Type can be more specific based on your API response
        console.log('Company Data:', data);
        this.companyData = data;
      },
      (error: any) => { // Type can be more specific based on your error response
        console.error('Error loading company data:', error);
      }
    );
  }
  

}
