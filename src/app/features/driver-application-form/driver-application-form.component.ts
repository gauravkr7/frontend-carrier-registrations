import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ServiceAuthService } from '../../service/service-auth.service';

@Component({
  selector: 'app-driver-application-form',
  templateUrl: './driver-application-form.component.html',
  styleUrl: './driver-application-form.component.css'
})
export class DriverApplicationFormComponent  implements OnInit {


    drivers: any[] = [];
    // newDriver: any = {};
    // newDriver: any = {IControlledSubstanceAndAlcohol: {}};
    
  
    newDriver: any = {
      IControlledSubstanceAndAlcohol: {
        Address: ''
      },
      IAddress: {
        FromDate: '',
        ToDate: '',
        City: '',
        State: '',
        Zip: '',
        Street: ''
      },
      ILicense: {
        State: '',
        Number: '',
        ExpirationDate: ''
      },
      IExperience: {
        TypeOfVehicleDriven: '',
        From: '',
        To: '',
        ApproximateMileageDriven: ''
      },
  
  IEmploymentHistory: {
    SubjectToFMCSR: '',
    SubjectToCFRPart40: '',
    ReasonForLeaving: ''
  }
    };
  showAdditionalOptions: boolean = false;
  
  
    onSubmit() {
      // Implement your submission logic here, e.g., form validation, sending data to the server, etc.
      console.log('Form submitted');
      // You can also close the offcanvas here if needed, using Bootstrap's JavaScript methods or Angular logic.
    }
    
    driverApplicationForm: FormGroup;
    driverName: string = '';
    applicantSignature: string = '';
    reviewDate: string = '';
    reviewedBySignature: string = '';
    motorCarrierAddress: string = '';
  
    // Define properties for fields used in the template
    certificateFields = [
      { label: 'Driver’s Name', value: '' },
      { label: 'Social Security Number', value: '' },
      { label: 'Operator’s License Number', value: '' },
      { label: 'State', value: '' },
      { label: 'Type of Power Unit', value: '' },
      { label: 'Type of Trailer(s)', value: '' },
      { label: 'Type of Bus', value: '' },
    ];
  
    violationRows = [
      { date: '', offense: '', location: '', typeOfVehicle: '' },
      { date: '', offense: '', location: '', typeOfVehicle: '' },
      { date: '', offense: '', location: '', typeOfVehicle: '' },
      { date: '', offense: '', location: '', typeOfVehicle: '' }
    ];
  
    dateFields = [
      { label: 'Date of Certification', value: '' },
      { label: 'Driver’s Signature', value: '' },
    ];
  
    driverFields = [
      { label: 'Full Name', value: '' },
      { label: 'License Number', value: '' },
      { label: 'State Issued', value: '' },
    ];
  
    testFields = [
      { label: 'Road Test', value: '' },
      { label: 'Written Test', value: '' },
    ];
  
    // Visibility controls
    isContentVisible: boolean = false;
    isSecondContentVisible: boolean = false;
    isTrafficViolationsVisible: boolean = false;
    isExplanationVisible: boolean = false;
    selectedOption: 'yes' | 'no' | null = null;
    isOffcanvasOpen: boolean = false;
  
    constructor(
      private fb: FormBuilder,
      private serviceAuthService: ServiceAuthService
    ) {
      // Initialize the form
      this.driverApplicationForm = this.fb.group({
        to: ['', Validators.required],
        date: ['', Validators.required],
        telephone: ['', Validators.required],
        fax: ['', Validators.required],
        applicantSignature: ['', Validators.required],
        witnessSignature: ['', Validators.required],
        witnessDate: ['', Validators.required],
      });
    }
  
    ngOnInit(): void {}
  
    toggleContent(): void {
      this.isContentVisible = !this.isContentVisible;
      this.isSecondContentVisible = false;
    }
  
    toggleSecondContent(): void {
      this.isSecondContentVisible = !this.isSecondContentVisible;
      this.isContentVisible = false;
    }
  
    toggleTrafficViolations(): void {
      this.isTrafficViolationsVisible = !this.isTrafficViolationsVisible;
    }
  
    nextPage(): void {
      this.isOffcanvasOpen = true;
    }
  
    closeOffcanvas(): void {
      this.isOffcanvasOpen = false;
    }
  
    onOptionChange(option: 'yes' | 'no') {
      if (this.selectedOption === option) {
        this.isExplanationVisible = !this.isExplanationVisible;
      } else {
        this.selectedOption = option;
        this.isExplanationVisible = true;
      }
    }
  
    submitForm() {
      if (this.driverApplicationForm.valid) {
        console.log('Form Submitted:', this.driverApplicationForm.value);
        this.serviceAuthService.createDriverapplication(this.driverApplicationForm.value).subscribe(
          response => {
            console.log('Driver application created successfully:', response);
            this.driverApplicationForm.reset();
          },
          error => {
            console.error('Error creating driver application:', error);
          }
        );
      } else {
        console.log('Form is invalid');
      }
    }
  }
  
  
  
  
    
  
    
