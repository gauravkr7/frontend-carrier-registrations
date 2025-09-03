import { Injectable , NgZone } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { error } from 'jquery';
import { tokenToString } from 'typescript';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ServiceAuthService {
  getAccountTypes() {
    throw new Error('Method not implemented.');
  }




createCarrierContactApiUrl : string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/carrierContacts/carriercontact/create';
updateCarrierContact: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/carrierContacts/carriercontact/update';
deleteCarrierContact:string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/carrierContacts/carriercontact/delete';
getAllCarrierContact: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/carrierContacts/carriercontact/getAll';
getByIDCarrierContact: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/carrierContacts/carriercontact/get ' ;


createNoteApiUrl: string =  'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/notes/notes/create';
updateNoteApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/notes/notes/update';
deleteNotesssApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/notes/notes/delete';
getAllNotesApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/notes/notes/getAll';
getNoteByIdApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/notes/notes/get';



createCrmApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/crm/create';
getAllCrmApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/crm/getAll';
getCrmByIdApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/crm/get'; // `${getCrmByIdApiUrl}/${id}`
updateCrmApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/crm/update'; // `${updateCrmApiUrl}/${id}`
deleteCrmApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/crm/crm/delete'; // `${deleteCrmApiUrl}/${id}`

createTaskApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/task/task/create';
getAllTaskApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/task/getAll';
gettaskByIdApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/task/task/get'; // `${getCrmByIdApiUrl}/${id}`
updateTaskApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/task/task/update'; // `${updateCrmApiUrl}/${id}`
deleteTaskApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/task/task/delete'; // `${deleteCrmApiUrl}/${id}`


createActivityLogApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/activelog/activitylog/create';
getAllActivityLogApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/activelog/activitylog/getAll';
getbyidActivityLogApiUrl: string = 'https://compliance-backend-debcf19b5689.herokuapp.com/api/activelog/activitylog/get';


  createPasswordapiUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/passwordmangar/passwordManager/create';
  getPasswordUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/passwordmangar/passwordManager/getAll';
  // getPasswordUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/passwordmangar/passwordManager/:id';
  updatePasswordUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/passwordmangar/passwordManager/update/:id'; // Update API URL
  deletePasswordUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/passwordmangar/passwordManager/delete/:id'; 


  

  passwordUpdateUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/change-password';

  loginUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/login';
  registerUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/register';
  getTrucksapiUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/truckList/truck';
  createTruckUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/truckList/truck/create'; // Add create API URL
  getTrailerapiUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/trailerList/trailer';
  trailercreateUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/trailerList/trailer/create'; // Add create API URL
  getdriverapiUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/driverList/driver';
  drivercreateUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/driverList/driver/create'; // Add create API URL


  getdriverapplicationapiUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/driverapplication/';
  createdriverapplicationUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/driverapplication/create'; // Add create API URL
  deleteDriverApplicationUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/driverapplication/delete'; // Add create API URL
  updateDriverApplicationUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/driverapplication/update'; // Update API URL

 
  fileapiUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/filemanager';
  filecreateUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/filemanager/create';
  getUsersapiUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/getAll';
  
  updateURL = 'https://compliance-backend-debcf19b5689.herokuapp.com'

  updateTruckUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/truckList/truck/update'; // Update API URL
  deleteTruckUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/truckList/truck/delete'; // Delete API URL
  updateTrailerUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/trailerList/trailer/update'; // Update API URL
  deleteTrailerUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/trailerList/trailer/delete'; // Delete API URL
  updateDriverUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/driverList/driver/update'; // Update API URL
  deleteDriverUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/driverList/driver/delete'; // Delete API URL
  updateFileUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/filemanager/update'; // Update API URL
  deleteFileUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/filemanager/delete'; // Delete API URL
  updateUserUrl : string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/user/update'; //update API URL
  deleteUserUrl : string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/user/delete'; // Delete API URL


  dashboardcreateUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/company/create';
  dashboardapiUrl: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/company/getAll';
  getcompanybyId: string ='https://compliance-backend-debcf19b5689.herokuapp.com/api/company';



  dotApi: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/dotdata"
  getDotData: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/dotdata"
  updateCompanyProfileUrl:string="https://compliance-backend-debcf19b5689.herokuapp.com/api/company/update"


  //Account Permit Section API
createAccountPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/account/create";
updateAccountPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/account/update";
deleteAccountPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/account/delete";
getAllAccountPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/account/getAll";
getAccountpermitByIdUrl : string ="https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/account/get";


// Expense Permit Section API
createuploadExpensePermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/expense/upload";
createExpensePermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/expense/create";
updateExpensePermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/expense/update";
deleteExpensePermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/expense/delete";
getAllExpensePermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/expense/getAll";
getExpensePermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/expense/get";

//SalesOrder permit Section API
createuploadSalesOrderPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/saleorder/upload";
createSalesOrderPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/saleorder/create";
updateSalesOrderPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/saleorder/update";
deleteSalesOrderPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/saleorder/delete";
getAllSalesOrderPermitUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/saleorder/getAll";
getSalesOrderPermitUrl: string =    "https://compliance-backend-debcf19b5689.herokuapp.com/api/accountpermit/saleorder/get";

// vender Section
createVenderUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/vender/vender/create";
updateVenderUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/vender/vender/update";
deleteVenderUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/vender/vender/delete";
getAllVendorUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/vender/vender/getall";
getVenderUrl: string =    "https://compliance-backend-debcf19b5689.herokuapp.com/api/vender/vender/get";

//Serivces Section

createServiceUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/service/service/create";
updateServiceUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/service/service/update";
deleteServiceUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/service/service/delete";
getAllServiceUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/service/service/getall";
getServiceUrl: string =    "https://compliance-backend-debcf19b5689.herokuapp.com/api/service/service/get";

driverFormBaseUrl: string = "https://compliance-backend-debcf19b5689.herokuapp.com/api/driverform";

private timeout: any;
private readonly idleTime = 30 * 60 * 1000; // 30 minutes


constructor(private http: HttpClient , private router: Router, private ngZone: NgZone) {   this.initListener();}


private resetTimer() {
  if (this.timeout) {
    clearTimeout(this.timeout);
  }

  this.timeout = setTimeout(() => {
    this.logout();
  }, this.idleTime);
}



private initListener() {
  this.ngZone.runOutsideAngular(() => {
    window.addEventListener('mousemove', () => this.resetTimer());
    window.addEventListener('click', () => this.resetTimer());
    window.addEventListener('keypress', () => this.resetTimer());
    this.resetTimer(); // start timer on load
  });
}
  login(email: string, password: string, rememberMe: boolean, name: string) {
    const body = { email, password, rememberMe, name };
    return this.http.post<any>(this.loginUrl, body).pipe(
      tap(response => {
        if (response && response.token) {
          // Store token and other details in localStorage
          localStorage.setItem('token', response.token);
          localStorage.setItem('role', response.role);
          if (response.companyId && response.companyId.length > 0) {
            localStorage.setItem('companyId', response.companyId[0]); // Assuming companyId is an array
          }
          localStorage.setItem('name', response.name); // Store user's name in local storage
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(error);
      })
    );
  }
  
  
  logout() {
    // Clear all local storage and session storage data
    localStorage.clear();
    sessionStorage.clear();
    
    // Redirect to the login page
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserType(): string | null {
    return localStorage.getItem('role');
  }

  // Register New User or Admin
  registerUser(userData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(this.registerUrl, userData, { headers });
  }

  // Get Reigisterd Users
  getUsersFromAPI() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.getUsersapiUrl}`, { headers });
  }


// Delete User
deleteUser(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set( 'Authorization', `Bearer ${token}`);

  return this.http.delete(`${this.getUsersapiUrl}/${id}`, { headers });
}

  //Create Trucks
  createTruck(truckData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(this.createTruckUrl, truckData, { headers });
  }

  //Get Trucks Api
  getTrucksFromAPI(status?: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const url = status ? `${this.getTrucksapiUrl}/getAll?status=${status}` : `${this.getTrucksapiUrl}/getAll`;

    return this.http.get(url, { headers });
  }

  // Get Trucks By Id
  getTruckById(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.getTrucksapiUrl}/get/${id}`;

    return this.http.get<any>(url, { headers });
  }

  // Update Trucks
  updateTruck(id: string, truckData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.updateTruckUrl}/${id}`, truckData, { headers });
  }

  // Delete Truck 
  deleteTruck(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.deleteTruckUrl}/${id}`, { headers });
  }

  // Create Trailers
  createTrailer(trailerData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(this.trailercreateUrl, trailerData, { headers });
  }

  //Get Trailers
  getTrailersFromAPI(status?: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const url = status ? `${this.getTrailerapiUrl}/getAll?status=${status}` : `${this.getTrailerapiUrl}/getAll`;

    return this.http.get(url, { headers });
  }

  // Get Trailer By Id
  getTrailerById(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.getTrailerapiUrl}/get/${id}`;

    return this.http.get<any>(url, { headers });
  }


  // Update Trailers
  updateTrailer(id: string, trailerData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.updateTrailerUrl}/${id}`, trailerData, { headers });
  }

  // Delete Trailer 
  deleteTrailer(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.deleteTrailerUrl}/${id}`, { headers });
  }

  // Create Drivers
  createDriver(driverData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(this.drivercreateUrl, driverData, { headers });
  }

  //Get Dreivers
  getDriversFromAPI(status?: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    const url = status ? `${this.getdriverapiUrl}/getAll?status=${status}` : `${this.getdriverapiUrl}/getAll`;

    return this.http.get(url, { headers });
  }

  //Get Drivers By ID
  getDriverById(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.getdriverapiUrl}/get/${id}`;

    return this.http.get<any>(url, { headers });
  }

  // Update Drivers
  updateDriver(id: string, driverData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.updateDriverUrl}/${id}`, driverData, { headers });
  }

  // Delete Trailer 
  deleteDriver(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.delete(`${this.deleteDriverUrl}/${id}`, { headers });
  }

  

  // Create DriverApplications
  createDriverapplication(driverapplicationData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
 
    return this.http.post(this.createdriverapplicationUrl, driverapplicationData, { headers });
  }
 
  // Get DriverApplications
  getDriverapplicationFromAPI(status?: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
 
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
 
    const url = status ? `${this.getdriverapplicationapiUrl}/getAll?status=${status}` : `${this.getdriverapplicationapiUrl}/getAll`;
 
    return this.http.get(url, { headers });
  }

  // Update Driver Application
  updateDriverApplication(id: string, driverApplicationData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.updateDriverApplicationUrl}/${id}`, driverApplicationData, { headers });
  }

  // Delete Driver Application
  deleteDriverApplication(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.deleteDriverApplicationUrl}/${id}`, { headers });
  }

  // Create files 
  createFile(fileData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(this.filecreateUrl, fileData, { headers });
  }

  // Get Files 
  getFilesFromAPI() {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.fileapiUrl}/getAll`, { headers });
  }

  // Update Users Password
  createUsers(usersData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(this.passwordUpdateUrl, usersData, { headers });
  }

  // Update Persmissions 
  updateUserPermissions(userId: string, permissions: any): Observable<any> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.put(`${this.updateURL}/update-permissions/${userId}`, { permissions }, { headers });
  }

  // Create Companies
  createCompany(companyData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post(this.dashboardcreateUrl, companyData, { headers });
  }

 
  //Get All Compines
  //Get All Compines
  getAllCompanies() {
    const token = this.getToken();
    const role = this.getUserType
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
 
 
    return this.http.get(`${this.dashboardapiUrl}?role=${role}`, { headers });
  }
  
  //Get company By Id
  getCompanyById(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.getcompanybyId}/get/${id}`;
    console.log('Fetching company by ID with URL:', url); 
    return this.http.get<any>(url, { headers });
  }

//Create dot
createDotCompany(companyData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.post(this.dotApi, companyData, { headers });
  }


//Get dots Api
//Get Dot NumberBydata
getByDotnumber(dot: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.getDotData}/${dot}`;
  console.log('Fetching Dot by ID with URL:', url); // Log the URL being called
  return this.http.get<any>(url, { headers });
  }


updateCompanyProfile(id: string , companyData: any){
  const token = this. getToken();
  if (!token) {
    throw new Error('No toekn stored')
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`)

  return this.http.put(`${this.updateCompanyProfileUrl}/${id}`,companyData ,{headers});
}

// Update File
 updateFile(id: string, fileData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.put(`${this.updateFileUrl}/${id}`, fileData, { headers });
}

// Delete File
deleteFile(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.delete(`${this.deleteFileUrl}/${id}`, { headers });
}

deleteUsers(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set( 'Authorization', `Bearer ${token}`);

  return this.http.delete(`${this.deleteUserUrl}/${id}`, { headers });
}
 // Update Trucks
 updateUsers(id: string, userData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  // When using FormData, you do not need to set the 'Content-Type' header explicitly.
  // Browser will automatically set it when sending multipart data.

  return this.http.put(`${this.updateUserUrl}/${id}`, userData, { headers });
}
// Accpunt Permit Section
// Create Account Permit
createAccountPermit(accountData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.post(this.createAccountPermitUrl, accountData, { headers }).pipe(
    catchError(error => {
      console.error('Error creating account permit:', error);
      return throwError(error);
    })
  );
}

// Get Account Permits from API
getAccountPermitFromAPI(status?: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = status ? `${this.getAllAccountPermitUrl}?status=${status}` : this.getAllAccountPermitUrl;
  return this.http.get(url, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching account permits:', error);
      return throwError(error);
    })
  );
}

// Get Account Permit by ID from API
getAccountPermitByIdFromAPI(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.getAccountpermitByIdUrl}/${id}`;
  return this.http.get<any>(url, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching account permit by ID:', error);
      return throwError(error);
    })
  );
}

// Update Account Permit
updateAccountPermit(id: string, accountData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put(`${this.updateAccountPermitUrl}/${id}`, accountData, { headers }).pipe(
    catchError(error => {
      console.error('Error updating account permit:', error);
      return throwError(error);
    })
  );
}

// Delete Account Permit
deleteAccountPermit(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete(`${this.deleteAccountPermitUrl}/${id}`, { headers }).pipe(
    catchError(error => {
      console.error('Error deleting account permit:', error);
      return throwError(error);
    })
  );
}
// Expense Permit Section
// Create Expense Permit
createExpensePermit(expenseData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(this.createExpensePermitUrl, expenseData, { headers }).pipe(
    catchError(error => {
      console.error('Error creating expense permit:', error);
      return throwError(error);
    })
  );
}

ExpenseuploadDocument(formData: FormData): Observable<any> {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    // Don't set Content-Type - let the browser set it for FormData
  });
  
  const url = `${this.createuploadExpensePermitUrl}`; // Ensure this is correct
  
  return this.http.post(url, formData, { headers }).pipe(
    catchError(error => {
      console.error('Error uploading document:', error);
      return throwError(error);
    })
  );
}


// Get Expense Permits from API
getExpensePermitFromAPI(status?: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = status ?`${this.getAllExpensePermitUrl}?status=${status}` : this.getAllExpensePermitUrl;
  return this.http.get(url, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching expense permits:', error);
      return throwError(error);
    })
  );
}

// Get Expense Permit by ID from API

getExpensePermitByIdFromAPI(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.getExpensePermitUrl}/${id}`;
  return this.http.get<any>(url, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching expense permit by ID:', error);
      return throwError(error);
    })
  );
}

// Update Expense Permit
updateExpensePermit(id: string, expenseData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch(`${this.updateExpensePermitUrl}/${id}`, expenseData, { headers }).pipe(
    catchError(error => {
      console.error('Error updating expense permit:', error);
      return throwError(error);
    })
  );
}

// Delete Expense Permit
deleteExpensePermit(expenseId: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  // Use path parameter for expenseId as required by backend
  return this.http.delete(`${this.deleteExpensePermitUrl}/${expenseId}`, { headers }).pipe(
    catchError(error => {
      console.error('Error deleting expense permit:', error);
      return throwError(error);
    })
  );
}

// SalesOrder Permit Section
// Create SalesOrder Permit

SalesuploadDocument(formData: FormData): Observable<any> {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.createuploadSalesOrderPermitUrl}`;
  return this.http.post(url, formData, { headers }).pipe(
    catchError(error => {
      console.error('Error uploading document:', error);
      return throwError(error);
    })
  );
}

createSalesOrderPermit(salesOrderData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(this.createSalesOrderPermitUrl, salesOrderData, { headers }).pipe(
    catchError(error => {
      console.error('Error creating sales order permit:', error);
      return throwError(error);
    })
  );
}

// Get SalesOrder Permits from API
// In ServiceAuthService
getSalesOrderPermitFromAPI(status?: string) {
  const token = this.getToken();
  if (!token) {
    return throwError('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = status 
    ? `${this.getAllSalesOrderPermitUrl}?status=${status}` 
    : this.getAllSalesOrderPermitUrl;
  
  return this.http.get(url, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching sales order permits:', error);
      return throwError(error);
    })
  );
}

// Get SalesOrder Permit by ID from API
getSalesOrderPermitByIdFromAPI(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.getSalesOrderPermitUrl}/${id}`;
  return this.http.get<any>(url, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching sales order permit by ID:', error);
      return throwError(error);
    })
  );
}

// Update SalesOrder Permit
updateSalesOrderPermit(id: string, salesOrderData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.patch(`${this.updateSalesOrderPermitUrl}/${id}`, salesOrderData, { headers }).pipe(
    catchError(error => {
      console.error('Error updating sales order permit:', error);
      return throwError(error);
    })
  );
}

// Delete SalesOrder Permit
deleteSalesOrderPermit(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete(`${this.deleteSalesOrderPermitUrl}/${id}`, { headers }).pipe(
    catchError(error => {
      console.error('Error deleting sales order permit:', error);
      return throwError(error);
    })
   );
  }

//venders section

  // Vender Section
  // Create Vender
  createVender(venderData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(this.createVenderUrl, venderData, { headers }).pipe(
      catchError(error => {
        console.error('Error creating vender:', error);
        return throwError(error);
      })
    );
  }

  // Get All Venders from API
  getAllVendors() {
    const token = this.getToken();
    if (!token) throw new Error('No token stored');
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get(this.getAllVendorUrl, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching vendors:', error);
        return throwError(() => new Error(error.message));
      })
    );
  }

  // Get Vender by ID from API
  getVenderById(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.getVenderUrl}/${id}`;
    return this.http.get<any>(url, { headers }).pipe(
      catchError(error => {
        console.error('Error fetching vender by ID:', error);
        return throwError(error);
      })
    );
  }

  // Update Vender
  updateVender(id: string, venderData: any) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.updateVenderUrl}/${id}`, venderData, { headers }).pipe(
      catchError(error => {
        console.error('Error updating vender:', error);
        return throwError(error);
      })
    );
  }

  // Delete Vender
  deleteVender(id: string) {
    const token = this.getToken();
    if (!token) {
      throw new Error('No token stored');
    }
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const url = `${this.deleteVenderUrl}/${id}`;
    return this.http.delete(url, { headers }).pipe(
      catchError(error => {
        console.error('Error deleting vendor:', error);
        return throwError(error);
      })
    );
  }
createService(serviceData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(this.createServiceUrl, serviceData, { headers }).pipe(
    catchError(error => {
      console.error('Error creating vender:', error);
      return throwError(error);
    })
  );
}

// Get All Venders from API
getAllService(): Observable<any[]> {
  const token = this.getToken();
  if (!token) throw new Error('No token stored');

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get<any[]>(this.getAllServiceUrl, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching services:', error);
      return throwError(() => new Error(error.message));
    })
  );
}
// Get Vender by ID from API
getServiceById(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.getServiceUrl}/${id}`;
  return this.http.get<any>(url, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching vender by ID:', error);
      return throwError(error);
    })
  );
}

// Update Vender
updateService(id: number, serviceData: any) { // Accepts id as number
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.put(`${this.updateServiceUrl}/${id}`, serviceData, { headers }).pipe(
    catchError(error => {
      console.error('Error updating service:', error);
      return throwError(error);
    })
  );
}

// Delete Vender
deleteService(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.deleteServiceUrl}/${id}`; // Ensure id is a number here
  return this.http.delete(url, { headers }).pipe(
    catchError(error => {
      console.error('Error deleting service:', error);
      return throwError(error);
    })
   );
}

// Create Password
createPassword(passwordData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  console.log('Creating password with data:', passwordData); // Debugging log

  return this.http.post(this.createPasswordapiUrl, passwordData, { headers }).pipe(
    tap(response => console.log('Password created successfully:', response)), // Debugging log
    catchError(error => {
      console.error('Error creating password:', error);
      return throwError(error);
    })
  );
}

// Get All Passwords
getPasswords() {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  console.log('Fetching all passwords'); // Debugging log

  return this.http.get(this.getPasswordUrl, { headers }).pipe(
    tap(response => console.log('Passwords fetched successfully:', response)), // Debugging log
    catchError(error => {
      console.error('Error fetching passwords:', error);
      return throwError(error);
    })
  );
}

// Update Password
updatePassword(id: string, passwordData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  console.log(`Updating password with ID ${id} and data:`, passwordData); // Debugging log

  return this.http.put(`${this.updatePasswordUrl.replace(':id', id)}`, passwordData, { headers }).pipe(
    tap(response => console.log('Password updated successfully:', response)), // Debugging log
    catchError(error => {
      console.error('Error updating password:', error);
      return throwError(error);
    })
  );
}

// Delete Password
deletePassword(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  console.log(`Deleting password with ID ${id}`); // Debugging log

  return this.http.delete(`${this.deletePasswordUrl.replace(':id', id)}`, { headers }).pipe(
    tap(response => console.log('Password deleted successfully:', response)), // Debugging log
    catchError(error => {
      console.error('Error deleting password:', error);
      return throwError(error);
    })
  );
}


// Create a new driver form
createDriverForm(driverFormData: any, documentFiles: File[]) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.post(`${this.driverFormBaseUrl}/create`, driverFormData, { headers });
}

// Get all driver forms
getAllDriverForms() {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization',` Bearer ${token}`);
  return this.http.get(`${this.driverFormBaseUrl}/getAll`, { headers });
}

// Get a driver form by ID
getDriverFormById(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.get(`${this.driverFormBaseUrl}/get/${id}`, { headers });
}

updateDriverForm(id: string, driverFormData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization',` Bearer ${token}`);
  return this.http.put(`${this.driverFormBaseUrl}/update/${id}`, driverFormData, { headers });
}

// Delete a driver form by ID
deleteDriverForm(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  return this.http.delete(`${this.driverFormBaseUrl}/delete/${id}`, { headers });
}
  // Approve Driver Form
  approveDriverForm(id: string, payload: any) {
    const token = this.getToken();
    if (!token) throw new Error('No token stored');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.driverFormBaseUrl}/approve/${id}`, payload, { headers });
  }

  // Reject Driver Form
  rejectDriverForm(id: string, payload: any) {
    const token = this.getToken();
    if (!token) throw new Error('No token stored');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.driverFormBaseUrl}/reject/${id}`, payload, { headers });
  }





//task api



createTask(taskData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.post(this.createTaskApiUrl, taskData, { headers });
}

// Get All CRM Records (Optional status param if needed later)
getAllTask() {
  const token = this.getToken();
  if (!token) throw new Error('No token stored');

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Fetching tasks from:', this.getAllTaskApiUrl); // Check URL

  return this.http.get(this.getAllTaskApiUrl, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching tasks:', error); // more accurate log
      return throwError(() => new Error(error.message));
    })
  );
}



// Get CRM by ID
getTaskById(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.gettaskByIdApiUrl}/${id}`;

  return this.http.get(url, { headers });
}

// Update CRM Record
updateTask(id: string, crmData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.updateTaskApiUrl}/${id}`;

  return this.http.put(url, crmData, { headers });
}

// Delete CRM Record
deleteTask(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.deleteTaskApiUrl}/${id}`;

  return this.http.delete(url, { headers });
}



createActivity(activityData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.post(this.createActivityLogApiUrl, activityData, { headers });
}

// Get All CRM Records (Optional status param if needed later)
getAllActivity() {
  const token = this.getToken();
  if (!token) throw new Error('No token stored');

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    console.log('Fetching tasks from:', this.getAllActivityLogApiUrl); // Check URL

  return this.http.get(this.getAllActivityLogApiUrl, { headers }).pipe(
    catchError(error => {
      console.error('Error fetching tasks:', error); // more accurate log
      return throwError(() => new Error(error.message));
    })
  );
}



// Get CRM by ID
getActivityById(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.getbyidActivityLogApiUrl}/${id}`;

  return this.http.get(url, { headers });
}


// 22 Aug Code For Note Record 


// Create Note
createNote(noteData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.post(this.createNoteApiUrl, noteData, { headers });
}

// Get All Notes
getAllNotes() {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get(this.getAllNotesApiUrl, { headers });
}

// Get Note by ID
getNoteById(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.getNoteByIdApiUrl}/${id}`;

  return this.http.get(url, { headers });
}

// Update Note
updateNote(id: string, noteData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.updateNoteApiUrl}/${id}`;

  return this.http.put(url, noteData, { headers });
}

// Delete Note
deleteNotesss(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.deleteNotesssApiUrl}/${id}`;

  return this.http.delete(url, { headers });
}






// Create Note
createCarrierContact(carriercontactData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.post(this.createCarrierContactApiUrl, carriercontactData, { headers });
}

// Get All Notes
getCarrierContact() {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get(this.getAllCarrierContact, { headers });
}

// Get Note by ID
getCarrierContactById(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.getByIDCarrierContact}/${id}`;

  return this.http.get(url, { headers });
}

// Update Note
updateCarrierContacts(id: string, noteData: any) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.updateCarrierContact}/${id}`;

  return this.http.put(url, noteData, { headers });
}

// Delete Note
deleteCarrierContacts(id: string) {
  const token = this.getToken();
  if (!token) {
    throw new Error('No token stored');
  }
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const url = `${this.deleteCarrierContact}/${id}`;

  return this.http.delete(url, { headers });
}


}
