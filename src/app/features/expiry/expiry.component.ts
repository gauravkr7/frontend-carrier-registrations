import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceAuthService } from '../../service/service-auth.service';
import { differenceInDays } from 'date-fns';

@Component({
  selector: 'app-expiry',
  templateUrl: './expiry.component.html',
  styleUrls: ['./expiry.component.css']
})
export class ExpiryComponent implements OnInit {
  companyId: string = '';
  driversData: any[] = [];
  companyData: any = null;
  isSidebarOpen: boolean = false;

  expiryCounts: { [key: string]: { expireIn30: number; expireIn20: number; expireIn10: number; expired: number } } = {};
  fields: string[] = []; // Define the missing 'fields' property

  constructor(private authService: ServiceAuthService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.companyId = this.route.snapshot.paramMap.get('id') || '';
    if (this.companyId) {
      this.loadCompanyData();
    }
    this.loadAllDriversData();
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar state:', this.isSidebarOpen);
  }

  loadCompanyData(): void {
    this.authService.getCompanyById(this.companyId).subscribe(
      (data: any) => {
        this.companyData = data;
        this.calculateExpiryCounts();
      },
      (error: any) => console.error('Error loading company data:', error)
    );
  }

  loadAllDriversData(): void {
    this.authService.getDriversFromAPI().subscribe(
      (data: any) => {
        this.driversData = data || [];
        this.calculateExpiryCounts();
      },
      (error: any) => console.error('Error loading driver data:', error)
    );
  }

  calculateExpiryCounts(): void {
    const currentDate = new Date();
    this.fields = [
      'workSubmitExpirationDate', 'cdlExpirationDate', 'medicalCardExpirationDate',
      'clearingExpirationDate', 'pullNoticeExpirationDate', 'sapReportExpirationDate', 'epnExpirationDate'
    ];

    this.expiryCounts = this.fields.reduce((acc, field) => {
      acc[field] = { expireIn30: 0, expireIn20: 0, expireIn10: 0, expired: 0 };
      return acc;
    }, {} as { [key: string]: { expireIn30: number; expireIn20: number; expireIn10: number; expired: number } });

    [...this.driversData, this.companyData].forEach((entity) => {
      if (!entity) return;
      this.fields.forEach((field) => {
        if (entity[field]) {
          const daysLeft = differenceInDays(new Date(entity[field]), currentDate);
          if (daysLeft <= 0) {
            this.expiryCounts[field].expired++;
          } else if (daysLeft <= 10) {
            this.expiryCounts[field].expireIn10++;
          } else if (daysLeft <= 20) {
            this.expiryCounts[field].expireIn20++;
          } else if (daysLeft <= 30) {
            this.expiryCounts[field].expireIn30++;
          }
        }
      });
    });

  
  }
}
