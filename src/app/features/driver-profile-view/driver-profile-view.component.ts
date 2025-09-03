import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ServiceAuthService } from '../../service/service-auth.service';

@Component({
  selector: 'app-driver-profile-view',
  templateUrl: './driver-profile-view.component.html',
  styleUrl: './driver-profile-view.component.css'
})
export class DriverProfileViewComponent {
  driverId: string | null = null;
  driverData: any;

  constructor(
    private route: ActivatedRoute,
    private serviceAuth: ServiceAuthService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.driverId = params.get('id');
      console.log('driver ID:', this.driverId); // Debug: Log truck ID
      if (this.driverId) {
        this.loaddriverData(this.driverId);
      } else {
        console.error('No driver ID found in route parameters.');
      }
    });
  }

  loaddriverData(id: string): void {
    if (!id) {
      console.error('ID is undefined or null');
      return;
    }
    console.log('Loading driver data for ID:', id);
    this.serviceAuth.getDriverById(id).subscribe(
      (data: any) => {
        console.log('driver Data:', data);

        // Defensive: ensure arrays exist
        const drivingExperiences = Array.isArray(data.drivingExperiences) ? data.drivingExperiences : [];
        const accidentRecords = Array.isArray(data.accidentRecords) ? data.accidentRecords : [];
        const trafficViolations = Array.isArray(data.trafficViolations) ? data.trafficViolations : [];
        const employmentHistory = Array.isArray(data.employmentHistory) ? data.employmentHistory : [];
        const randomDrugTestCCFs = Array.isArray(data.randomDrugTestCCFs) ? data.randomDrugTestCCFs : [];
        const randomDrugTestResults = Array.isArray(data.randomDrugTestResults) ? data.randomDrugTestResults : [];
        const miscDocuments = Array.isArray(data.miscDocuments) ? data.miscDocuments : [];

        // Assign all backend fields, and add computed fields for view
        this.driverData = {
          ...data,
          driverName: [data.firstName, data.middleName, data.lastName].filter(Boolean).join(' '),
          address: [
            data.currentAddressStreet,
            data.currentAddressCity,
            data.currentAddressState,
            data.currentAddressZipcode
          ].filter(Boolean).join(', '),
          mailingAddress: [
            data.mailingAddressStreet,
            data.mailingAddressCity,
            data.mailingAddressState,
            data.mailingAddressZipcode
          ].filter(Boolean).join(', '),
          previousAddressLast10Years: [
            data.previousAddressStreet,
            data.previousAddressCity,
            data.previousAddressState,
            data.previousAddressZipcode
          ].filter(Boolean).join(', '),
          drivingExperiences,
          accidentRecords,
          trafficViolations,
          employmentHistory,
          randomDrugTestCCFs,
          randomDrugTestResults,
          miscDocuments,
          numberOfPreviousEmployers: employmentHistory.length,
          companyNameHistory: employmentHistory.map((e: any) => e.companyName || ''),
          companyName: employmentHistory.length > 0 && employmentHistory[0]?.companyName ? employmentHistory[0].companyName : '',
          companyAddress: employmentHistory.length > 0
            ? [employmentHistory[0].street, employmentHistory[0].city, employmentHistory[0].state, employmentHistory[0].zipcode].filter(Boolean).join(', ')
            : '',
          companyDates: employmentHistory.length > 0
            ? [employmentHistory[0].startDate, employmentHistory[0].endDate].filter(Boolean).join(' - ')
            : '',
          companyPhone: employmentHistory.length > 0 && employmentHistory[0]?.contactNo ? employmentHistory[0].contactNo : '',
          companyEmail: employmentHistory.length > 0 && employmentHistory[0]?.email ? employmentHistory[0].email : '',
          federalMotorCarrierSafetyRegulations1: employmentHistory.length > 0 && employmentHistory[0]?.fmcsaSubject ? employmentHistory[0].fmcsaSubject : '',
          dotSensitive: employmentHistory.length > 0 && employmentHistory[0]?.dotSensitive ? employmentHistory[0].dotSensitive : '',
          positionHeld: employmentHistory.length > 0 && employmentHistory[0]?.positionHeld ? employmentHistory[0].positionHeld : '',
          gapsExplanation: employmentHistory.length > 0 && employmentHistory[0]?.gapsExplanation ? employmentHistory[0].gapsExplanation : '',
          // Add all document numbers, expiry, and all fields from driver-list
          previousAddressYears: data.previousAddressYears || '',
          currentCdlState: data.currentCdlState || '',
          currentCdlNumber: data.currentCdlNumber || '',
          currentCdlType: data.currentCdlType || '',
          currentCdlEndorsements: data.currentCdlEndorsements || '',
          currentCdlIssueDate: data.currentCdlIssueDate || '',
          currentCdlExpirationDate: data.currentCdlExpirationDate || '',
          oldCdlState: data.oldCdlState || '',
          oldCdlNumber: data.oldCdlNumber || '',
          oldCdlType: data.oldCdlType || '',
          oldCdlEndorsements: data.oldCdlEndorsements || '',
          oldCdlIssueDate: data.oldCdlIssueDate || '',
          oldCdlExpirationDate: data.oldCdlExpirationDate || '',
          cdlNumber: data.cdlNumber || '',
          cdlExpiry: data.cdlExpiry || '',
          medicalCertificateNumber: data.medicalCertificateNumber || '',
          medicalCertificateExpiry: data.medicalCertificateExpiry || '',
          mvrNumber: data.mvrNumber || '',
          mvrPullDate: data.mvrPullDate || '',
          backgroundCheckNumber: data.backgroundCheckNumber || '',
          backgroundCheckDate: data.backgroundCheckDate || '',
          pspNumber: data.pspNumber || '',
          pspPullDate: data.pspPullDate || '',
          workAuthNumber: data.workAuthNumber || '',
          workAuthExpiry: data.workAuthExpiry || '',
          ssnNumber: data.ssnNumber || '',
          preClearingHouseNumber: data.preClearingHouseNumber || '',
          preClearingHouseExpiry: data.preClearingHouseExpiry || '',
          preDrugTestCCFNumber: data.preDrugTestCCFNumber || '',
          preDrugTestCCFDate: data.preDrugTestCCFDate || '',
          preDrugTestResultNumber: data.preDrugTestResultNumber || '',
          preDrugTestResultDate: data.preDrugTestResultDate || '',
          annualClearingHouseNumber: data.annualClearingHouseNumber || '',
          annualClearingHouseExpiry: data.annualClearingHouseExpiry || '',
          pullNoticeNumber: data.pullNoticeNumber || '',
          pullNoticeExpiry: data.pullNoticeExpiry || '',
          nationalRegistryNumber: data.nationalRegistryNumber || '',
          nationalRegistryExpiry: data.nationalRegistryExpiry || '',
          roadTestNumber: data.roadTestNumber || '',
          roadTestDate: data.roadTestDate || '',
          // Document URLs
          uploadDocument1: data.cdlFileUrl || '',
          uploadDocument2: data.workAuthFileUrl || '',
          uploadDocument3: data.medicalCertificateFileUrl || '',
          uploadDocument4: data.sphFileUrl || '',
          uploadDocument5: data.driverRoadTestExaminationFormFileUrl || '',
          uploadDocument6: data.companyPolicyFileUrl || '',
          uploadDocument7: data.warningLettersFileUrl || '',
          uploadDocument8: data.mvrFileUrl || '',
          uploadDocument9: data.backgroundCheckFileUrl || '',
          uploadDocument10: data.safetyTrainingCertificateFileUrl || '',
          uploadDocument11: data.clearingHouseAnnualQueryFileUrl || '',
          uploadDocument12: data.pullNoticeFileUrl || '',
          uploadDocument13: data.roadTestFileUrl || '',
          uploadDocument14: data.xyzFileUrl || '',
          insuranceDocument: data.insuranceDocumentFileUrl || '',
          ssnFileUrl: data.ssnFileUrl || '',
          preClearingHouseFileUrl: data.preClearingHouseFileUrl || '',
          preDrugTestCCFFileUrl: data.preDrugTestCCFFileUrl || '',
          preDrugTestResultFileUrl: data.preDrugTestResultFileUrl || '',
          annualClearingHouseFileUrl: data.annualClearingHouseFileUrl || '',
          pspFileUrl: data.pspFileUrl || '',
          // Driving Experience
          drivingExperience: drivingExperiences.length > 0 && drivingExperiences[0].classOfEquipment ? drivingExperiences[0].classOfEquipment : '',
          equipmentType: drivingExperiences.length > 0 && drivingExperiences[0].typeOfEquipment ? drivingExperiences[0].typeOfEquipment : '',
          approxMiles: drivingExperiences.length > 0 && drivingExperiences[0].approxMiles ? drivingExperiences[0].approxMiles : '',
          // Other fields
          controlledSubstanceAlcoholQuestionnaire: data.controlledSubstanceAlcoholQuestionnaire || '',
          driverRoadTestExaminationForm: data.driverRoadTestExaminationForm || '',
          companyPolicy: data.companyPolicy || '',
          drugAlcoholClearingHouseConsentForm: data.drugAlcoholClearingHouseConsentForm || '',
          randomDrugAlcoholTestingConsentForm: data.randomDrugAlcoholTestingConsentForm || '',
          newHirePriorSevenDayWorkStatement: data.newHirePriorSevenDayWorkStatement || '',
          newHireControlCustodyForm: data.newHireControlCustodyForm || '',
          newHireDrugTestingResult: data.newHireDrugTestingResult || '',
          clearingHouseAnnualQuery: data.clearingHouseAnnualQuery || '',
          licenseDenied: data.licenseDenied || '',
          licenseDeniedExplain: data.licenseDeniedExplain || '',
          licenseSuspended: data.licenseSuspended || '',
          licenseSuspendedExplain: data.licenseSuspendedExplain || '',
          noAccidents: data.noAccidents || false,
          noCitations: data.noCitations || false,
          // Add any other fields from driver-list here as needed
          serialNumber: data.serialNumber || data.cdlNumber || '',
          license: data.license || data.cdlNumber || '',
          licenseExpirationDate: data.licenseExpirationDate || data.cdlExpiry || '',
          driverDOTMedical: data.driverDOTMedical || data.medicalCertificateNumber || '',
          medicalExpirationDate: data.medicalExpirationDate || data.medicalCertificateExpiry || '',
          dmvDrivingRecord: data.dmvDrivingRecord || data.mvrNumber || '',
          pullRecordLatest: data.pullRecordLatest || data.mvrPullDate || '',
          workAuthorization: data.workAuthorization || data.workAuthNumber || '',
          workAuthorizationExpirationDate: data.workAuthorizationExpirationDate || data.workAuthExpiry || '',
          previousLicenseNumber: data.previousLicenseNumber || data.oldCdlNumber || '',
        };
        // Debug: Show mapped driverData in console for field verification
        console.log('Mapped driverData for view:', this.driverData);
      },
      (error: any) => {
        console.error('Error loading driver data:', error);
      }
    );
  }
}
