import { Component, OnInit } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-driver-application-form',
  templateUrl: './driver-application-form.component.html',
  styleUrls: ['./driver-application-form.component.css']
})
export class DriverApplicationFormComponent implements OnInit {
  firstName: string = '';
  lastName: string = '';
  fullSignature: string = '';

  currentFormIndex: number = 1; // Start with the first form
  showPreviousAddressForm = false;
  isLicenseDeniedYes = false;
  isLicenseRevokedYes = false;
  isFelonyYes = false;
  isDuiYes = false;
  isMilitaryYes = false;
  isDotTest1Yes = false;
  isDotTest2Yes = false;
  isDotTest3Yes = false;
  showDrugAlcoholcollapse = false;
  MotorVehicleRecord = false;
  FMCSA = false;
  SafetyPerformanceHistory = false;
  ApplicantCertification = false;
  showOtherLicenseForm: boolean = false;
  currentStep: number = 1;
  mvrSignature: any;
  allSignaturesPresent: boolean = false;
  medicalCardFileInput?: File;

  constructor(
    private serviceAuthService: ServiceAuthService,
    private toastr: ToastrService
  ) {}

  driverApplication: any = {
    firstName: '',
    middleName: '',
    lastName: '',
    otherNames: '',
    ssn: '',
    dob: '',
    applicationDate: '',
    positionApplied: '',
    availabilityDate: '',
     legalRightToWork: '',
    // legalRightToWork: false,
    phoneNumber: '', // frontend field
    phone: '', // backend required
    emailAddress: '',
    currentAddress: '',
    currentStreet: '', // backend required
    city: '', // frontend field
    currentCity: '', // backend required
    state: '', // frontend field
    currentState: '', // backend required
    zipCode: '', // frontend field
    currentZip: '', // backend required
    currentAddressYears: null, // frontend field
    currentYears: null, // backend required
    currentAddressMonths: null, // frontend field
    currentMonths: null, // backend required
    previousAddresses: [
      { street: '', city: '', state: '', zip: '', years: '', months: '' }
    ],
    licenses: [
      { licenseNumber: '', stateOfIssuance: '', licenseClass: '', endorsements: '', expirationDate: '' }
    ],
    drivingExperiences: [
      { equipmentType: '', typeOfEquipment: '', drivingExperienceDate1: '', drivingExperienceDate2: '', totalMiles: '', stateOperatedIn: '' }
    ],
    employmentHistories: [
      { employerName: '', employerPhoneNumber: '', employerAddress: '', employerContactPerson: '', positionHeld: '', salaryOrPayRate: '', employmentStartDate: '', employmentEndDate: '', reasonForLeaving: '', fmcsa: '', dot_sensitive: '', auth_contact: '' }
    ],
    trafficConvictions: [
      { trafficConvictionDate: '', trafficConvictionLocation: '', trafficConvictionNature: '', trafficConvictionPenalty: '', cmv: '' }
    ],
    accidentRecords: [
      { accidentDate: '', accidentLocation: '', accidentNature: '', accidentFatalities: '', accidentInjuries: '', hazmat_spill: '' }
    ],
    deniedLicense: false,
    deniedLicenseDetails: '',
    licenseSuspended: false,
    suspendedDetails: '',
    felonyConviction: false,
    felonyDetails: '',
    duiConviction: false,
    duiDetails: '',
    servedInMilitary: false,
    militaryBranch: '',
    rankAtDischarge: '',
    serviceFromDate: '',
    serviceToDate: '',
    militaryExperience: '',
    educationLevel: '', // required
    schoolName: '',
    schoolCity: '',
    schoolState: '',
    areaOfStudy: '',
    hasDotMedicalCard: false,
    medicalCardFile: '',
    hasMedicalCondition: false,
    testedPositive: false,
    positiveTestDetails: '',
    refusedTest: false,
    refusedTestDetails: '',
    otherViolations: false,
    otherViolationsDetails: '',
    mvrConsent: false,
    mvrSignature: '',
    mvrConsentDate: '',
    pspConsent: false,
    otherLicenses: [{ licenseNumber: '', state: '', status: '', date: '' }]
  };

  submitted = false;

  // Section 16: Driver Documents
  documents: any[] = [{ documentName: '', documentExpiration: '', documentUrl: '' }];
  documentUrl:   (File | undefined)[] = [undefined];

  ngOnInit() {
    // ...existing code...
  }

  goNext() {
    if (this.currentStep < 5) {
      this.currentStep++;
    }
    const nextForm = document.getElementById(`${this.currentFormIndex + 1}`);
    const currentForm = document.getElementById(`${this.currentFormIndex}`);
    if (nextForm && currentForm) {
      currentForm.style.display = 'none';
      nextForm.style.display = 'block';
      this.currentFormIndex++;
    }

         // Scroll to top after showing next form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  
  }

  goBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
    if (this.currentFormIndex > 1) {
      const previousForm = document.getElementById(`${this.currentFormIndex - 1}`);
      const currentForm = document.getElementById(`${this.currentFormIndex}`);
      if (previousForm && currentForm) {
        currentForm.style.display = 'none';
        previousForm.style.display = 'block';
        this.currentFormIndex--;
      }
    }
    // Scroll to top after showing previous form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addPreviousAddress() {
    this.driverApplication.previousAddresses.push({
      street: '',
      city: '',
      state: '',
      zip: '',
      years: '',
      months: ''
    });
  }

  removePreviousAddress(index: number) {
    this.driverApplication.previousAddresses.splice(index, 1);
  }

  // License methods
  addLicense() {
    this.driverApplication.licenses.push({ licenseNumber: '', stateOfIssuance: '', licenseClass: '', endorsements: '', expirationDate: '' });
  }
  removeLicense(i: number) {
    if (this.driverApplication.licenses.length > 1) {
      this.driverApplication.licenses.splice(i, 1);
    }
  }

  // Other License methods
  addOtherLicense() {
    this.driverApplication.otherLicenses.push({ licenseNumber: '', state: '', status: '', date: '' });
  }
  removeOtherLicense(i: number) {
    if (this.driverApplication.otherLicenses.length > 1) {
      this.driverApplication.otherLicenses.splice(i, 1);
    }
  }

  // Driving Experience methods
  addDrivingExperience() {
    this.driverApplication.drivingExperiences.push({ equipmentType: '', typeOfEquipment: '', drivingExperienceDate1: '', drivingExperienceDate2: '', totalMiles: '', stateOperatedIn: '' });
  }
  removeDrivingExperience(i: number) {
    if (this.driverApplication.drivingExperiences.length > 1) {
      this.driverApplication.drivingExperiences.splice(i, 1);
    }
  }

  // Employment History methods
  addEmploymentHistory() {
    this.driverApplication.employmentHistories.push({ employerName: '', employerPhoneNumber: '', employerAddress: '', employerContactPerson: '', positionHeld: '', salaryOrPayRate: '', employmentStartDate: '', employmentEndDate: '', reasonForLeaving: '', fmcsa: '', dot_sensitive: '', auth_contact: '' });
  }
  removeEmploymentHistory(i: number) {
    if (this.driverApplication.employmentHistories.length > 1) {
      this.driverApplication.employmentHistories.splice(i, 1);
    }
  }

  // Traffic Conviction methods
  addTrafficConviction() {
    this.driverApplication.trafficConvictions.push({ trafficConvictionDate: '', trafficConvictionLocation: '', trafficConvictionNature: '', trafficConvictionPenalty: '', cmv: '' });
  }
  removeTrafficConviction(i: number) {
    if (this.driverApplication.trafficConvictions.length > 1) {
      this.driverApplication.trafficConvictions.splice(i, 1);
    }
  }

  // Accident Record methods
  addAccidentRecord() {
    this.driverApplication.accidentRecords.push({ accidentDate: '', accidentLocation: '', accidentNature: '', accidentFatalities: '', accidentInjuries: '', hazmat_spill: '' });
  }
  removeAccidentRecord(i: number) {
    if (this.driverApplication.accidentRecords.length > 1) {
      this.driverApplication.accidentRecords.splice(i, 1);
    }
  }

  // Document file change handler
  onDocumentFileChange(event: any, index: number) {
    const file = event.target.files[0];
    this.documentUrl[index] = file;
  }

  // Medical card file change handler
  onMedicalCardFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.medicalCardFileInput = file;
      this.driverApplication.medicalCardFile = file.name;
    } else {
      this.medicalCardFileInput = undefined;
      this.driverApplication.medicalCardFile = '';
    }
  }

  // Add document row
  addDocument() {
    this.documents.push({ documentName: '', documentExpiration: '', documentUrl: '' });
    this.documentUrl.push(undefined);
  }

  // Remove document row
  removeDocument(index: number) {
    this.documents.splice(index, 1);
    this.documentUrl.splice(index, 1);
  }

  submitForm() {
    this.submitted = true;
    // Map frontend fields to backend-required fields
    this.driverApplication.phone = this.driverApplication.phoneNumber;
    this.driverApplication.currentStreet = this.driverApplication.currentAddress;
    this.driverApplication.currentCity = this.driverApplication.city;
    this.driverApplication.currentState = this.driverApplication.state;
    this.driverApplication.currentZip = this.driverApplication.zipCode;
    this.driverApplication.currentYears = this.driverApplication.currentAddressYears;
    this.driverApplication.currentMonths = this.driverApplication.currentAddressMonths;
    this.driverApplication.email = this.driverApplication.emailAddress;

    // Filter documents to only those with a file selected
    const filteredDocuments = this.documents
      .map((doc, idx) => ({ ...doc, file: this.documentUrl[idx] }))
      .filter(doc => doc.file); // Only keep documents with a file

    this.driverApplication.documents = filteredDocuments.map(doc => ({
      documentName: doc.documentName,
      documentExpiration: doc.documentExpiration,
      documentUrl: '' // Will be set after upload
    }));

    // Create FormData and append all fields
    const formData = new FormData();
    // Append all primitive fields
    Object.keys(this.driverApplication).forEach(key => {
      const value = this.driverApplication[key];
      if (Array.isArray(value) || typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value !== undefined && value !== null ? value : '');
      }
    });

    // Append each document file as documents[i][documentUrl]
    filteredDocuments.forEach((doc, idx) => {
      if (doc.file) {
        formData.append(`documents[${idx}][documentUrl]`, doc.file, doc.file.name);
      }
    });
    // Append medical card file if present
    if (this.medicalCardFileInput) {
      formData.append('medicalCardFile', this.medicalCardFileInput, this.medicalCardFileInput.name);
    }

    // Submit using FormData
    this.serviceAuthService.createDriverForm(formData, []).subscribe({
      next: (response: any) => {
        // Suppose response.documentUrls is an array of URLs in the same order as uploaded files
        if (response.documentUrls && Array.isArray(response.documentUrls)) {
          response.documentUrls.forEach((url: string, i: number) => {
            if (this.driverApplication.documents[i]) {
              this.driverApplication.documents[i].documentUrl = url;
            }
          });
        }
        this.toastr.success('Driver application form submitted successfully!', 'Success');
      },
      error: (error: any) => {
        this.toastr.error('Error submitting form', 'Error');
      }
    });
  }

 // ...existing code...
updateSignature() {
  // Example: Check if all required signatures are filled
  const requiredSignatures = [
    this.driverApplication.mvrSignature,
    this.driverApplication.pspSignature,
    this.driverApplication.safetyPerformanceSignature,
    this.driverApplication.ApplicantCertificationSignature
  ];
  this.allSignaturesPresent = requiredSignatures.every(sig => !!sig && sig.trim().length > 0);
}

onFileChange(event: Event, index: number): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    // File size validation (10 MB = 10485760 bytes)
    if (file.size > 10485760) {
      this.toastr.error('File size should not exceed 10 MB.', 'File Size Error');
      input.value = '';
      return;
    }
    this.documentUrl[index] = file;
    input.value = '';
  }
}

removeFile(index: number): void {
  this.documentUrl[index] = undefined;
}

}
