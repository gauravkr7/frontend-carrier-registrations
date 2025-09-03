import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceAuthService } from '../../service/service-auth.service';
import { differenceInDays } from 'date-fns';

@Component({
  selector: 'app-expiryview',
  templateUrl: './expiryview.component.html',
  styleUrls: ['./expiryview.component.css'],
})
export class ExpiryviewComponent implements OnInit {
  isSidebarOpen: boolean = false;
  driver: any;
  driversData: any[] = [];
  companyData: any = null;
  companyId: string = '';

  // Expiration counts
  expireIn30Days: number = 0;
  expireIn15Days: number = 0;
  expireIn10Days: number = 0;
  alreadyExpired: number = 0;

  constructor(
    private authService: ServiceAuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id') || '';

    if (this.companyId) {
      this.loadCompanyData();
    }

    this.loadAllDriversData();
  }

  loadCompanyData(): void {
    this.authService.getCompanyById(this.companyId).subscribe(
      (data: any) => {
        if (data) {
          this.companyData = data;
        }
      },
      (error: any) => console.error('Error loading company data:', error)
    );
  }

  loadAllDriversData(): void {
    this.authService.getDriversFromAPI().subscribe(
      (data: any) => {
        console.log('Raw Driver Data:', data); // Debugging API response
  
        if (Array.isArray(data)) {
          // Filter drivers who have at least one expiration date
          this.driversData = data.filter((driver) =>
            [
              driver.workAuthorizationExpirationDate,
              driver.cdlExpirationDate,
              driver.medicalCardExpirationDate,
              driver.clearingExpirationDate,
              driver.pullNoticeExpirationDate,
              driver.sapReportExpirationDate,
              driver.epnExpirationDate
            ].some((date) => date) // Keep if at least one exists
          );
  
          console.log('Filtered Drivers:', this.driversData); // Debugging filtered data
          this.calculateExpiryCounts();
        } else {
          console.warn('Unexpected API response format:', data);
        }
      },
      (error: any) => console.error('Error loading driver data:', error)
    );
  }

  expiryCounts: { [key: string]: { expireIn30Days: number; expireIn15Days: number; expireIn10Days: number; alreadyExpired: number } } = {};

  calculateExpiryCounts(): void {
    const currentDate = new Date();
  
    // Reset counts for each category
    this.expiryCounts = {
      workSubmitExpirationDate: { expireIn30Days: 0, expireIn15Days: 0, expireIn10Days: 0, alreadyExpired: 0 },
      cdlExpirationDate: { expireIn30Days: 0, expireIn15Days: 0, expireIn10Days: 0, alreadyExpired: 0 },
      medicalCardExpirationDate: { expireIn30Days: 0, expireIn15Days: 0, expireIn10Days: 0, alreadyExpired: 0 },
      clearingExpirationDate: { expireIn30Days: 0, expireIn15Days: 0, expireIn10Days: 0, alreadyExpired: 0 },
      pullNoticeExpirationDate: { expireIn30Days: 0, expireIn15Days: 0, expireIn10Days: 0, alreadyExpired: 0 },
      sapReportExpirationDate: { expireIn30Days: 0, expireIn15Days: 0, expireIn10Days: 0, alreadyExpired: 0 },
      epnExpirationDate: { expireIn30Days: 0, expireIn15Days: 0, expireIn10Days: 0, alreadyExpired: 0 }
    };
  
    this.driversData.forEach((driver) => {
      Object.keys(this.expiryCounts).forEach((field) => {
        if (driver[field]) {
          const expiryDate = new Date(driver[field]);
  
          if (isNaN(expiryDate.getTime())) {
            console.warn(`❌ Invalid Expiration Date: ${driver[field]}`);
            return;
          }
  
          const daysLeft = this.getDaysDifference(expiryDate, currentDate);
          console.log(`✅ ${driver.driverName} (${field}) expires in ${daysLeft} days`);
  
          if (daysLeft <= 0) {
            this.expiryCounts[field].alreadyExpired++;
          } else if (daysLeft <= 10) {
            this.expiryCounts[field].expireIn10Days++;
          } else if (daysLeft <= 15) {
            this.expiryCounts[field].expireIn15Days++;
          } else if (daysLeft <= 30) {
            this.expiryCounts[field].expireIn30Days++;
          }
        }
      });
    });
  
    console.log("📊 Updated Expiry Counts:", this.expiryCounts);
  }
  
  

  private getDaysDifference(date1: Date, date2: Date): number {
    return differenceInDays(date1, date2);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  getExpirationStatus(dateStr: string): string {
    if (!dateStr) return 'N/A'; // Handle missing dates
    
    const expiryDate = new Date(dateStr);
    if (isNaN(expiryDate.getTime())) return 'Invalid Date';
  
    const currentDate = new Date();
    const daysLeft = this.getDaysDifference(expiryDate, currentDate);
  
    if (daysLeft <= 0) return 'Already Expired';
    if (daysLeft <= 10) return 'Expires in 10 Days';
    if (daysLeft <= 15) return 'Expires in 15 Days';
    if (daysLeft <= 30) return 'Expires in 30 Days';
    return 'Valid';
  }
}
