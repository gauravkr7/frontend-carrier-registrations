import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  companyId: string | null = null;

  constructor(private router: Router) {
    this.loadCompanyId();
  }

  loadCompanyId(): void {
    this.companyId = localStorage.getItem('companyId');
  }
}