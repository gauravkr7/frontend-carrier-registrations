import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { CompanyProfileComponent } from './features/company-profile/company-profile.component';
import { TruckListComponent } from './features/truck-list/truck-list.component';
import { TrailerListComponent } from './features/trailer-list/trailer-list.component';
import { DriverApplicationComponent } from './features/driver-application/driver-application.component';
import { FileManagerComponent } from './features/file-manager/file-manager.component';
import { UsersComponent } from './features/users/users.component';
import { DriverListComponent } from './features/driver-list/driver-list.component';
import { DocumentComponent } from './features/document/document.component';
import { TrucklistViewComponent } from './features/truck-list-view/truck-list-view.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DriverProfileViewComponent } from './features/driver-profile-view/driver-profile-view.component';
import { UsersProfileComponent } from './features/users-profile/users-profile.component';
import { TrailerListViewComponent } from './features/trailer-list-view/trailer-list-view.component';
import { DriverApplicationFormComponent } from './features/driver-application-form/driver-application-form.component';
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
import { VendorComponent } from './features/vendor/vendor.component';
import { ExpiryviewComponent } from './features/expiryview/expiryview.component';
import { ServicessComponent } from './features/servicess/servicess.component';
import { CustomerComponent } from './features/customer/customer.component';
import { AuthGuard } from './auth.guard'; 
import { SaledetailsComponent } from './features/saledetails/saledetails.component';
import { ExpensedetailsComponent } from './features/expensedetails/expensedetails.component';
import { DriverApplicationViewComponent } from './features/driver-application-view/driver-application-view.component';
import { CrmComponent } from './features/crm/crm.component';
import  { TaskManagerComponent } from './features/task-manager/task-manager.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  // { path: '**', redirectTo: '/login' },
  { path: 'login', component: LoginComponent },
  { path: 'company-profile/:id', component: CompanyProfileComponent , canActivate: [AuthGuard]}, // Add this line
  { path: 'truck-list', component: TruckListComponent, canActivate: [AuthGuard]},
  { path: 'trailer-list', component: TrailerListComponent , canActivate: [AuthGuard]},
  { path: 'driver-list', component: DriverListComponent , canActivate: [AuthGuard]},
  { path: 'driver-application', component: DriverApplicationComponent , canActivate: [AuthGuard]},
  { path: 'file-manager', component: FileManagerComponent , canActivate: [AuthGuard]},
  { path: 'users', component: UsersComponent , canActivate: [AuthGuard]},

  { path: 'document', component: DocumentComponent , canActivate: [AuthGuard]},
  { path: 'document/:id', component: DocumentComponent , canActivate: [AuthGuard]},

  { path: 'document/:id', component: DocumentComponent , canActivate: [AuthGuard]},

  { path: 'truck-list-view/:id' , component : TrucklistViewComponent , canActivate: [AuthGuard]},
  { path:'trailer-list-view/:id', component:TrailerListViewComponent , canActivate: [AuthGuard]},
  { path: 'driver-profile-view/:id' , component : DriverProfileViewComponent , canActivate: [AuthGuard]},
  {path :'dashboard', component: DashboardComponent , canActivate: [AuthGuard]},
  {path :'users-profile-view', component: UsersProfileComponent , canActivate: [AuthGuard]},
{path : 'driver-application-form' , component : DriverApplicationFormComponent },
  {path : 'employment-application-form' , component : EmploymentApplicationFormComponent , canActivate: [AuthGuard]},
  {path : 'drug-policy' , component : DrugPolicyComponent , canActivate: [AuthGuard]},
  {path : 'clearing-house-consent-form' , component : ClearingHouseConsentFormComponent , canActivate: [AuthGuard]},
  {path : 'background-consent-form' , component : BackgroundConsentFormComponent , canActivate: [AuthGuard]},
  {path : 'mvr-form' , component : MvrFormComponent , canActivate: [AuthGuard]},
  {path : 'sph-form' , component : SphFormComponent , canActivate: [AuthGuard]},
  {path : 'annual-review-from' , component : AnnualReviewFromComponent , canActivate: [AuthGuard]},
  {path : 'hos-service-record' , component : HosServiceRecordComponent , canActivate: [AuthGuard]},
  {path : 'i-9-form' , component : I9FormComponent , canActivate: [AuthGuard]},
  {path : 'road-test-form' , component : RoadTestFormComponent , canActivate: [AuthGuard]},
  {path : 'w-9-form' , component : W9FormComponent , canActivate: [AuthGuard]},
  {path : 'psp-form' , component : PspFormComponent , canActivate: [AuthGuard]},
  {path : 'expiry' , component :  ExpiryComponent , canActivate: [AuthGuard]},
  {path : 'password-manager' , component : PasswordManagerComponent , canActivate: [AuthGuard]},
  {path : 'sidebar' , component : SidebarComponent , canActivate: [AuthGuard]},
  {path : 'accountpermits' , component : AccountPermitsComponent , canActivate: [AuthGuard]},
  {path : 'vendor' , component : VendorComponent , canActivate: [AuthGuard]},
  {path : 'expiryview' , component : ExpiryviewComponent , canActivate: [AuthGuard]},
  {path : 'servicess' , component : ServicessComponent , canActivate: [AuthGuard]},
  {path : 'customer' , component : CustomerComponent , canActivate: [AuthGuard]},
  {path : 'saledetails/:salesId', component: SaledetailsComponent, canActivate: [AuthGuard]},
  { path: 'expensedetails/:expenseId', component: ExpensedetailsComponent ,  canActivate: [AuthGuard]},
  { path: 'driver-application-view', component: DriverApplicationViewComponent },
  { path: 'driver-application-view/:id', component: DriverApplicationViewComponent },
  {path: 'crm', component: CrmComponent, canActivate: [AuthGuard]},
  {path: 'task-manager', component: TaskManagerComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
