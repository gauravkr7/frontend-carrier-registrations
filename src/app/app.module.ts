import { NgModule } from '@angular/core';
import { ServiceAuthService } from './service/service-auth.service';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http'; // Import HttpClientModule
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './features/login/login.component';
import { UsersComponent } from './features/users/users.component';
import { CompanyProfileComponent } from './features/company-profile/company-profile.component';
import { NavbarComponent } from './Component/navbar/navbar.component';
import { FooterComponent } from './Component/footer/footer.component';
import { TruckListComponent } from './features/truck-list/truck-list.component';
import { TrailerListComponent } from './features/trailer-list/trailer-list.component';
import { DriverListComponent } from './features/driver-list/driver-list.component';
import { DriverApplicationComponent } from './features/driver-application/driver-application.component';
import { FileManagerComponent } from './features/file-manager/file-manager.component';
import { DocumentComponent } from './features/document/document.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TrucklistViewComponent } from './features/truck-list-view/truck-list-view.component';
import { DriverProfileViewComponent } from './features/driver-profile-view/driver-profile-view.component';
import { UsersProfileComponent } from './features/users-profile/users-profile.component';
import { TrailerListViewComponent } from './features/trailer-list-view/trailer-list-view.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { EmploymentApplicationFormComponent } from './features/employment-application-form/employment-application-form.component';
import { DrugPolicyComponent } from './features/drug-policy/drug-policy.component';
import { ClearingHouseConsentFormComponent } from './features/clearing-house-consent-form/clearing-house-consent-form.component';
import { BackgroundConsentFormComponent } from './features/background-consent-form/background-consent-form.component';
import { MvrFormComponent } from './features/mvr-form/mvr-form.component';
import { SphFormComponent } from './features/sph-form/sph-form.component';
import { AnnualReviewFromComponent } from './features/annual-review-from/annual-review-from.component';
import { HosServiceRecordComponent } from './features/hos-service-record/hos-service-record.component';
import { I9FormComponent } from './features/i-9-form/i-9-form.component';
import { RoadTestFormComponent } from './features/road-test-form/road-test-form.component';
import { W9FormComponent } from './features/w-9-form/w-9-form.component';
import { PspFormComponent } from './features/psp-form/psp-form.component';
import { ExpiryComponent } from './features/expiry/expiry.component';
import { PasswordManagerComponent } from './features/password-manager/password-manager.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AccountPermitsComponent } from './features/account-permits/account-permits.component';
import { CommonModule } from '@angular/common';
import { VendorComponent } from './features/vendor/vendor.component';
import { ExpiryviewComponent } from './features/expiryview/expiryview.component';
import { ServicessComponent } from './features/servicess/servicess.component';
import { CustomerComponent } from './features/customer/customer.component';
import { SaledetailsComponent } from './features/saledetails/saledetails.component';
import { ExpensedetailsComponent } from './features/expensedetails/expensedetails.component'; // Add this import
import { RouterModule } from '@angular/router'; // Import RouterModule
import { DriverApplicationFormComponent } from './features/driver-application-form/driver-application-form.component';
import { DriverApplicationViewComponent } from './features/driver-application-view/driver-application-view.component';
import { CrmComponent } from './features/crm/crm.component';
import { TaskManagerComponent } from './features/task-manager/task-manager.component';







@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    UsersComponent,
    CompanyProfileComponent,
    NavbarComponent,
    FooterComponent,
    TruckListComponent,
    TrailerListComponent,
    DriverListComponent,
    DriverApplicationComponent,
    FileManagerComponent,
    DocumentComponent,
    DashboardComponent,
    TrucklistViewComponent,
    DriverProfileViewComponent,
    UsersProfileComponent,
    TrailerListViewComponent,
    DriverApplicationFormComponent,
    EmploymentApplicationFormComponent,
    DrugPolicyComponent,
    ClearingHouseConsentFormComponent,
    BackgroundConsentFormComponent,
    MvrFormComponent,
    SphFormComponent,
    AnnualReviewFromComponent,
    HosServiceRecordComponent,
    I9FormComponent,
    RoadTestFormComponent,
    W9FormComponent,
    PspFormComponent,
    ExpiryComponent,
    PasswordManagerComponent,
    SidebarComponent,
    AccountPermitsComponent,
    VendorComponent,
    ExpiryviewComponent,
    ServicessComponent,
    CustomerComponent,
    SaledetailsComponent,
    ExpensedetailsComponent,
    DriverApplicationFormComponent,
    DriverApplicationViewComponent,
    CrmComponent,
    TaskManagerComponent,
 

    

    
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule, // Include HttpClientModule here
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }), // No need for explicit typing here
    CommonModule, // Add this
    RouterModule // Include RouterModule here
    // other modules
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


