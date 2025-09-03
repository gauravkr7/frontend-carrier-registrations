import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-driver-application-view',
  templateUrl: './driver-application-view.component.html',
  styleUrl: './driver-application-view.component.css'
})
export class DriverApplicationViewComponent implements OnInit {


  @ViewChild('approveModal') approveModal!: ElementRef;
  approvalNotes: string = '';
  nextStep: string = '';
  approvalLevel: string = '';
doc: any;

  getDocumentFileName(arg0: string) {
    throw new Error('Method not implemented.');
  }
  decodeURIComponent(arg0: any) {
    throw new Error('Method not implemented.');
  }

  @ViewChild('checklistModal') checklistModal!: ElementRef;
  driverId: string | null = null;
  driverData: any = null;

  driverApplication: any = {};
  documents: any[] = [];
  currentStep = 1; 

  @ViewChild('rejectModal') rejectModal!: ElementRef;

rejectionReason: string = '';
rejectionExplanation: string = '';
rejectionFollowup: string = '';
rejectionNotify: string[] = [];

isVerifiedSections: boolean[] = Array(16).fill(false);

  
  isVerified: boolean = false;
  showPreviousAddressForm = false;
  showDrugAlcoholcollapse = false;
  MotorVehicleRecord = false;
  FMCSA = false;
  SafetyPerformanceHistory = false;
  ApplicantCertification = false;

  
  isLicenseDeniedYes = false;
  isLicenseRevokedYes = false;
  isFelonyYes = false;
  isDuiYes = false;
  isMilitaryYes = false;
  isDotTest1Yes = false;
  isDotTest2Yes = false;
  isDotTest3Yes = false;
  documentUrl: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private serviceAuthService: ServiceAuthService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.driverId = params.get('id');
      if (this.driverId) {
        this.loadDriverData(this.driverId);
      }
    });
  }
  loadDriverData(id: string) {
    this.serviceAuthService.getDriverFormById(id).subscribe(
      (data: any) => {
        this.driverData = data;
        this.driverApplication = { ...data };

    

        // Helper to map boolean or string to 'yes'/'no'
        const boolToYesNo = (val: any) => val === true ? 'yes' : val === false ? 'no' : (val === 'yes' || val === 'no' ? val : 'no');

        // Map all relevant fields (add more as needed)
        this.driverApplication.license_denied = boolToYesNo(data.deniedLicense);
        this.driverApplication.license_revoked = boolToYesNo(data.licenseSuspended);
        this.driverApplication.felony = boolToYesNo(data.felonyConviction);
        this.driverApplication.dui = boolToYesNo(data.duiConviction);
        this.driverApplication.servedInMilitary = boolToYesNo(data.servedInMilitary);
        this.driverApplication.hasDotMedicalCard = boolToYesNo(data.hasDotMedicalCard);
        this.driverApplication.hasMedicalCondition = boolToYesNo(data.hasMedicalCondition);
        this.driverApplication.testedPositive = boolToYesNo(data.testedPositive);
        this.driverApplication.refusedTest = boolToYesNo(data.refusedTest);
        this.driverApplication.otherViolations = boolToYesNo(data.otherViolations);
        this.driverApplication.mvrConsent = boolToYesNo(data.mvrConsent);
        this.driverApplication.pspConsent = boolToYesNo(data.pspConsent);
        this.driverApplication.SafetyPerformanceHistory = boolToYesNo(data.SafetyPerformanceHistory);
        // DO NOT map status to yes/no! Keep as string enum
        if (typeof data.status === 'boolean') {
          this.driverApplication.status = data.status === true ? 'pending' : 'rejected';
        } else if (['pending', 'approved', 'rejected'].includes(data.status)) {
          this.driverApplication.status = data.status;
        } else {
          this.driverApplication.status = 'pending'; // fallback
        }
        this.driverApplication.dot_med_cert = boolToYesNo(data.hasDotMedicalCard);
        this.driverApplication.medical_condition = boolToYesNo(data.hasMedicalCondition);
        this.driverApplication.dot_test_1 = boolToYesNo(data.testedPositive);
        this.driverApplication.dot_test_2 = boolToYesNo(data.refusedTest);
        this.driverApplication.dot_test_3 = boolToYesNo(data.otherViolations);
        this.driverApplication.mvr_consent = boolToYesNo(data.mvrConsent);
        this.driverApplication.psp_report = boolToYesNo(data.pspConsent);
        this.driverApplication.SafetyPerformanceHistory = boolToYesNo(data.SafetyPerformanceHistory);

        // Set UI state for radio button logic
        this.isLicenseDeniedYes = this.driverApplication.license_denied === 'yes';
        this.isLicenseRevokedYes = this.driverApplication.license_revoked === 'yes';
        this.isFelonyYes = this.driverApplication.felony === 'yes';
        this.isDuiYes = this.driverApplication.dui === 'yes';
        this.isMilitaryYes = this.driverApplication.servedInMilitary === 'yes';
        this.isDotTest1Yes = this.driverApplication.testedPositive === 'yes';
        this.isDotTest2Yes = this.driverApplication.refusedTest === 'yes';
        this.isDotTest3Yes = this.driverApplication.otherViolations === 'yes';

          if (typeof this.driverData.status === 'boolean') {
  this.driverData.status = this.driverData.status === true ? 'pending' : 'rejected';
}


        // Defensive: default to 'no' if not 'yes' or 'no', but skip status
        [
          'license_denied', 'license_revoked', 'felony', 'dui', 'servedInMilitary',
          'hasDotMedicalCard', 'hasMedicalCondition', 'testedPositive', 'refusedTest', 'otherViolations',
          'mvrConsent', 'pspConsent', 'SafetyPerformanceHistory'
        ].forEach(field => {
          if (this.driverApplication[field] !== 'yes' && this.driverApplication[field] !== 'no') {
            this.driverApplication[field] = 'no';
          }
        });

        // Map arrays as before (no change needed)
        if (Array.isArray(data.drivingExperience)) {
          this.driverApplication.drivingExperiences = data.drivingExperience.map((item: any) => ({
            equipmentType: item.equipmentType,
            typeOfEquipment: item.equipmentSubType,
            drivingExperienceDate1: item.fromDate,
            drivingExperienceDate2: item.toDate,
            totalMiles: item.totalMiles,
            stateOperatedIn: item.operatedStates
          }));
        } else {
          this.driverApplication.drivingExperiences = [];
        }
        if (Array.isArray(data.trafficConvictions)) {
          this.driverApplication.trafficConvictions = data.trafficConvictions.map((item: any) => ({
            trafficConvictionDate: item.date || '',
            trafficConvictionLocation: item.location || '',
            trafficConvictionNature: item.violation || '',
            trafficConvictionPenalty: item.penalty || '',
            cmv: item.wasInCMV ? 'yes' : 'no'
          }));
        } else {
          this.driverApplication.trafficConvictions = [];
        }
        if (Array.isArray(data.employmentHistory)) {
          this.driverApplication.employmentHistories = data.employmentHistory.map((item: any) => ({
            employerName: item.employerName,
            employerPhoneNumber: item.phone,
            employerAddress: item.address,
            employerContactPerson: item.contactPerson,
            positionHeld: item.positionHeld,
            salaryOrPayRate: item.payRate,
            employmentStartDate: item.startDate,
            employmentEndDate: item.endDate,
            reasonForLeaving: item.reasonForLeaving,
            fmcsa: item.subjectToFMCSA ? "yes" : "no",
            dot_sensitive: item.safetySensitive ? "yes" : "no",
            auth_contact: item.authorizeContact ? "yes" : "no",
            additionalComments: item.additionalComments || "",
          }));
        } else {
          this.driverApplication.employmentHistories = [];
        }
        if (Array.isArray(data.accidentRecords)) {
          this.driverApplication.accidentRecords = data.accidentRecords.map((item: any) => ({
            accidentDate: item.date || '',
            accidentLocation: item.location || '',
            accidentNature: item.nature || '',
            accidentFatalities: item.fatalities != null ? String(item.fatalities) : '',
            accidentInjuries: item.injuries != null ? String(item.injuries) : '',
            hazmat_spill: item.hazmatSpill ? 'yes' : 'no'
          }));
        } else {
          this.driverApplication.accidentRecords = [];
        }
        this.documents = data.documents ? [...data.documents] : [];
        this.driverApplication.previousAddresses = Array.isArray(data.previousAddresses) ? data.previousAddresses : [];
        this.driverApplication.licenses = data.licenses || [];
        // Always show previous address form if data exists
        this.showPreviousAddressForm = Array.isArray(this.driverApplication.previousAddresses) && this.driverApplication.previousAddresses.length > 0;
        // Always sync documentUrl array with documents
        this.documentUrl = this.documents.map(doc => '');

        // Load isVerifiedSections from backend (handle stringified or array)
        if (data.isVerifiedSections) {
          let arr = data.isVerifiedSections;
          if (typeof arr === 'string') {
            try {
              arr = JSON.parse(arr);
            } catch {
              arr = [];
            }
          }
          if (Array.isArray(arr) && arr.length === 16) {
            this.isVerifiedSections = [...arr];
          } else {
            this.isVerifiedSections = Array(16).fill(false);
          }
        } else {
          this.isVerifiedSections = Array(16).fill(false);
        }
      console.log('Loaded isVerifiedSections:', this.isVerifiedSections);

      },
      (error: any) => {
        console.error('Error loading driver application:', error);
      }
    );
  }

  submitForm() {
    if (!this.driverId) return;

    // Normalize status to string enum
    if (this.driverApplication.status === true) {
      this.driverApplication.status = 'pending';
    } else if (this.driverApplication.status === false) {
      this.driverApplication.status = 'rejected';
    } else if (!['pending', 'approved', 'rejected'].includes(this.driverApplication.status)) {
      this.driverApplication.status = 'pending';
    }

    // Prepare documents payload for backend
    const documentsPayload = this.documents.map((doc, idx) => {
      const file = this.documentUrl[idx];
      if (file && typeof file === 'object' && 'name' in file && 'size' in file) {
        // New file selected: set documentUrl to '' (backend will update)
        return { ...doc, documentUrl: '' };
      } else {
        // No new file: keep existing documentUrl (even if it's a valid URL)
        return doc;
      }
    });

    const formData = new FormData();

    // Append all driverApplication fields except files/arrays handled separately
    Object.keys(this.driverApplication).forEach(key => {
      const value = this.driverApplication[key];
      if (key === 'medicalCardFile' || key === 'documents') return;
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Save isVerifiedSections (verified/unverified status for each section)
    formData.append('isVerifiedSections', JSON.stringify(this.isVerifiedSections));

    // Attach each new/changed document file as documents[i][documentUrl]
    this.documents.forEach((doc, idx) => {
      const file = this.documentUrl[idx];
      if (file && typeof file === 'object' && 'name' in file && 'size' in file) {
        formData.append(`documents[${idx}][documentUrl]`, file as File, (file as File).name);
      }
    });
    // Attach the full documents array (metadata)
    formData.append('documents', JSON.stringify(documentsPayload));

    // Attach medical card file if present
    if (
      this.driverApplication.medicalCardFile &&
      typeof this.driverApplication.medicalCardFile === 'object' &&
      'name' in this.driverApplication.medicalCardFile &&
      'size' in this.driverApplication.medicalCardFile
    ) {
      formData.append('medicalCardFile', this.driverApplication.medicalCardFile);
    }

    // Debug logs (optional, can be removed in production)
    // console.log('Documents to be sent:', this.documents);
    // console.log('Documents being sent:', documentsPayload);
    // const dataPayload = { ...this.driverApplication, documents: documentsPayload };
    // console.log('Full data payload (before FormData):', dataPayload);
    // formData.forEach((value, key) => {
    //   console.log('FormData:', key, value);
    // });

    this.serviceAuthService.updateDriverForm(this.driverId, formData).subscribe(
      (res: any) => {
        this.toastr.success('Driver application updated successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      },
      (err: any) => {
        if (
          err?.error?.error === 'Driver not found' ||
          err?.error?.error === 'Driver form not found'
        ) {
          this.toastr.error('Driver not found. Please check the driver ID or try again.', 'Error');
        } else if (err && err.error && err.error.message === 'Access denied. No token provided.') {
          this.toastr.error('Session expired or not logged in. Please login again.');
        } else {
          this.toastr.error('Failed to update driver application');
        }
      }
    );
  }

  // Navigation for multi-step form
  goNext() {
    this.currentStep++;
  }
  goBack() {
    if (this.currentStep > 1) this.currentStep--;
  }

  // Previous Addresses
  addPreviousAddress() {
    if (!this.driverApplication.previousAddresses) this.driverApplication.previousAddresses = [];
    this.driverApplication.previousAddresses.push({
      street: '', city: '', state: '', zip: '', years: '', months: ''
    });
  }
  removePreviousAddress(i: number) {
    if (this.driverApplication.previousAddresses && this.driverApplication.previousAddresses.length > 1) {
      this.driverApplication.previousAddresses.splice(i, 1);
    }
  }

  // Driving Experience
  addDrivingExperience() {
    if (!this.driverApplication.drivingExperiences) this.driverApplication.drivingExperiences = [];
    this.driverApplication.drivingExperiences.push({
      equipmentType: '', typeOfEquipment: '', drivingExperienceDate1: '', drivingExperienceDate2: '', totalMiles: '', stateOperatedIn: ''
    });
  }
  removeDrivingExperience(i: number) {
    if (this.driverApplication.drivingExperiences && this.driverApplication.drivingExperiences.length > 1) {
      this.driverApplication.drivingExperiences.splice(i, 1);
    }
  }

  // Employment History
  addEmploymentHistory() {
    if (!this.driverApplication.employmentHistories) this.driverApplication.employmentHistories = [];
    this.driverApplication.employmentHistories.push({
      employerName: '', employerPhoneNumber: '', employerAddress: '', employerContactPerson: '', positionHeld: '', salaryOrPayRate: '', employmentStartDate: '', employmentEndDate: '', reasonForLeaving: '', fmcsa: '', dot_sensitive: '', auth_contact: '', additionalComments: ''
    });
  }
  removeEmploymentHistory(i: number) {
    if (this.driverApplication.employmentHistories && this.driverApplication.employmentHistories.length > 1) {
      this.driverApplication.employmentHistories.splice(i, 1);
    }
  }

  // Traffic Convictions
  addTrafficConviction() {
    if (!this.driverApplication.trafficConvictions) this.driverApplication.trafficConvictions = [];
    this.driverApplication.trafficConvictions.push({
      trafficConvictionDate: '', trafficConvictionLocation: '', trafficConvictionNature: '', trafficConvictionPenalty: '', cmv: ''
    });
  }
  removeTrafficConviction(i: number) {
    if (this.driverApplication.trafficConvictions && this.driverApplication.trafficConvictions.length > 1) {
      this.driverApplication.trafficConvictions.splice(i, 1);
    }
  }

  // Accident Records
  addAccidentRecord() {
    if (!this.driverApplication.accidentRecords) this.driverApplication.accidentRecords = [];
    this.driverApplication.accidentRecords.push({
      accidentDate: '', accidentLocation: '', accidentNature: '', accidentFatalities: '', accidentInjuries: '', hazmat_spill: ''
    });
  }
  removeAccidentRecord(i: number) {
    if (this.driverApplication.accidentRecords && this.driverApplication.accidentRecords.length > 1) {
      this.driverApplication.accidentRecords.splice(i, 1);
    }
  }

  // Document upload
  addDocument() {
    this.documents.push({ documentName: '', documentExpiration: '', documentUrl: '' });
    this.documentUrl.push('');
  }
  removeDocument(i: number) {
    // Always remove the entire row from both arrays, regardless of length
    this.documents.splice(i, 1);
    this.documentUrl.splice(i, 1);
  }
  onFileChange(event: any, i: number) {
    const file = event.target.files[0];
    if (file) {
      this.documentUrl[i] = file;
      // You may want to upload the file here and set documents[i].documentUrl to the uploaded file URL
    }
  }
  removeFile(i: number) {
    this.documentUrl[i] = '';
    this.documents[i].documentUrl = '';
  }

  // Medical Card File
  onMedicalCardFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      // You may want to upload the file and set driverApplication.medicalCardFile to the uploaded file URL
      this.driverApplication.medicalCardFile = file;
    }
  }

  // Signature update stub
  updateSignature() { }
  onRadioChange(field: string, value: string) {
    switch (field) {
      case 'license_denied':
        this.isLicenseDeniedYes = value === 'yes';
        this.driverApplication.license_denied = value;
        break;
      case 'license_revoked':
        this.isLicenseRevokedYes = value === 'yes';
        this.driverApplication.license_revoked = value;
        break;
      case 'felony':
        this.isFelonyYes = value === 'yes';
        this.driverApplication.felony = value;
        break;
      case 'dui':
        this.isDuiYes = value === 'yes';
        this.driverApplication.dui = value;
        break;
      case 'servedInMilitary':
        this.isMilitaryYes = value === 'yes';
        this.driverApplication.servedInMilitary = value;
        break;
    }
  }

  checklistSections: string[] = [
  'Applicant Information',
  'License Information',
  'Driving Experience',
  'Employment History',
  'Traffic Convictions',
  'Accident Record',
  'Criminal History',
  'Military Service',
  'Education',
  'Medical Certification',
  'Alcohol and Controlled Substances History',
  'Motor Vehicle Record (MVR) Consent',
  'FMCSA Pre-Employment Screening Program (PSP)',
  'Safety Performance History',
  'Applicant Certification',
  'Driver Documents'
];


trackByIndex(index: number, item: any) {
  return index;
}

 
 onClose(): void {
    this.closeOffCanvas();
    this.toastr.info('Closed successfully.');
  }
closeOffCanvas() {
  const offcanvasEl = document.getElementById('addLocation');
  if (offcanvasEl) {
   
    let offcanvasInstance = (window as any).bootstrap?.Offcanvas?.getInstance(offcanvasEl);
    if (!offcanvasInstance && (window as any).bootstrap?.Offcanvas) {
      
      offcanvasInstance = new (window as any).bootstrap.Offcanvas(offcanvasEl);
    }
    if (offcanvasInstance) {
      offcanvasInstance.hide();
    }
  }
}
trackByFn(index: number, item: any): number {
  return index; 
}

setSectionStatus(index: number, status: boolean) {
 
  this.isVerifiedSections = [
    ...this.isVerifiedSections.slice(0, index),
    status,
    ...this.isVerifiedSections.slice(index + 1)
  ];
}


openApproveModal() {
    // Show the approve modal using Bootstrap JS
    const modalEl = this.approveModal?.nativeElement;
    if (modalEl) {
      const modal = (window as any).bootstrap?.Modal
        ? new (window as any).bootstrap.Modal(modalEl)
        : null;
      if (modal) modal.show();
    }
  }

  closeApproveModal() {
    const modalEl = this.approveModal?.nativeElement;
    if (modalEl) {
      const modal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
      if (modal) modal.hide();
    }
    // Optionally clear form fields
    this.approvalNotes = '';
    this.nextStep = '';
    this.approvalLevel = '';
  }

confirmApprove() {
  if (!this.approvalNotes || !this.nextStep || !this.approvalLevel) {
    this.toastr.error('Please fill all required fields.');
    return;
  }
  if (!this.driverId) return;

  const payload = {
    approvalNotes: this.approvalNotes,
    nextStep: this.nextStep,
    approvalLevel: this.approvalLevel,
    isVerifiedSections: this.isVerifiedSections // <-- Add this line
  };

  this.serviceAuthService.approveDriverForm(this.driverId, payload).subscribe(
    (res: any) => {
      this.toastr.success('Application approved!');
      this.closeApproveModal();
      setTimeout(() => window.location.reload(), 1500);
    },
    (err: any) => {
      this.toastr.error('Failed to approve application');
    }
  );
}





openRejectModal() {
  const modalEl = this.rejectModal?.nativeElement;
  if (modalEl) {
    const modal = (window as any).bootstrap?.Modal
      ? new (window as any).bootstrap.Modal(modalEl)
      : null;
    if (modal) modal.show();
  }
}

closeRejectModal() {
  const modalEl = this.rejectModal?.nativeElement;
  if (modalEl) {
    const modal = (window as any).bootstrap?.Modal?.getInstance(modalEl);
    if (modal) modal.hide();
  }
  // Optionally clear form fields
  this.rejectionReason = '';
  this.rejectionExplanation = '';
  this.rejectionFollowup = '';
  this.rejectionNotify = [];
}



  confirmReject() {
    if (!this.rejectionReason || !this.rejectionExplanation) {
      this.toastr.error('Please fill all required fields.');
      return;
    }
    if (!this.driverId) return;

    const payload = {
      rejectionReason: this.rejectionReason,
      rejectionExplanation: this.rejectionExplanation,
      rejectionFollowup: this.rejectionFollowup,
      rejectionNotify: this.rejectionNotify
    };

    this.serviceAuthService.rejectDriverForm(this.driverId, payload).subscribe(
      (res: any) => {
        this.toastr.success('Application rejected!');
        this.closeRejectModal();
        setTimeout(() => window.location.reload(), 1500);
      },
      (err: any) => {
        this.toastr.error('Failed to reject application');
      }
    );
  }

copyEditSummary() {
  const summary = this.driverData?.lastEditSummary || 'No summary available.';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(summary);
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = summary;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
}


}
