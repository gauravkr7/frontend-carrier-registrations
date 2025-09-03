import { ChangeDetectorRef, Component, OnInit, Renderer2 } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';
import { SharedUtilityService } from '../../shared/shared-utility.service';
 
@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent implements OnInit {
  files: any[] = [];
  newFile: any = {};
  fileIdToDelete: string | null = null;
  fileToEdit: any = {};
  originalFileData: any = {};
  companies: any[] = [];
  isSidebarOpen: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 10;
 
  constructor(
    private cdr: ChangeDetectorRef,
    private serviceAuthService: ServiceAuthService,
    private toastr: ToastrService,
    private renderer: Renderer2,
    private sharedUtilityService: SharedUtilityService
  ) { }
 
  ngOnInit(): void {
    this.loadFiles();
    this.loadCompany();
    this.setupOffcanvasClose();
  }
 
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
 
  loadCompany() {
    this.serviceAuthService.getAllCompanies().subscribe((data: any) => {
      this.companies = data;
      this.cdr.detectChanges();
    }, error => {
      console.error('Error loading companies:', error);
    });
  }
 
  findCompanyName(companyId: string | string[]): string {
    if (Array.isArray(companyId)) {
      companyId = companyId.length > 0 ? companyId[0] : '';
    }
    const company = this.companies.find(company => company._id === companyId);
    return company ? company.companyName : 'N/A';
  }
 
  loadFiles() {
    this.serviceAuthService.getFilesFromAPI()
      .subscribe((data: any) => {
        this.files = data;
      }, error => {
        console.error(error);
        this.toastr.error('Failed to load files.', 'Error');
      });
  }
 
  onFileChange(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      this.newFile[key] = file;
    } else {
      this.newFile[key] = null;
    }
  }
 
  submitForm() {
    const formData = new FormData();
    Object.keys(this.newFile).forEach(key => {
      formData.append(key, this.newFile[key]);
    });
 
    this.serviceAuthService.createFile(formData)
      .subscribe((response: any) => {
        this.toastr.success('File created successfully!', 'Success');
        this.loadFiles();
        this.newFile = {};
      }, error => {
        console.error('Error creating file:', error);
        this.toastr.error('Failed to create file.', 'Error');
      });
  }
 
  setFileToDelete(file: any) {
    this.fileIdToDelete = file._id ? file._id : null;
  }
 
  deleteFile(id?: string) {
    if (id) {
      this.serviceAuthService.deleteFile(id).subscribe((response: any) => {
        this.toastr.success('File deleted successfully!', 'Success');
        this.loadFiles();
        this.fileIdToDelete = null;
      }, error => {
        console.error('Error deleting file:', error);
        this.toastr.error('Failed to delete file.', 'Error');
      });
    }
  }
 
  editFile(file: any) {
    this.fileToEdit = {
      _id: file._id,
      companyName: file.companyName,
      description: file.description
    };
    this.originalFileData = { ...this.fileToEdit };
  }
 
  fileEditFile(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      this.fileToEdit[key] = file;
    }
  }
 
  hasChanges(): boolean {
    return JSON.stringify(this.fileToEdit) !== JSON.stringify(this.originalFileData);
  }
 
  updateFile() {
    if (!this.hasChanges()) {
      this.toastr.error('No changes detected. Please modify the file details before saving.', 'Error');
      return;
    }
 
    const formData = new FormData();
    formData.append('companyName', this.fileToEdit.companyName);
    formData.append('description', this.fileToEdit.description);
   
    if (this.fileToEdit.fileUpload instanceof File) {
      formData.append('fileUpload', this.fileToEdit.fileUpload);
    }
 
    this.serviceAuthService.updateFile(this.fileToEdit._id, formData).subscribe(
      (response: any) => {
        this.toastr.success('File updated successfully!', 'Success');
        this.loadFiles();
        this.fileToEdit = {};
        this.originalFileData = {};
      },
      (error) => {
        console.error('Error updating file:', error);
        this.toastr.error('Failed to update file.', 'Error');
      }
    );
  }
 
  setupOffcanvasClose() {
    this.sharedUtilityService.setupOffcanvasClose(this.renderer);
  }

  getPageNumbers(): number[] {
    const totalPages = this.getTotalPages();
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  getTotalPages(): number {
    return Math.ceil(this.files.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  getPaginatedFiles(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.files.slice(startIndex, startIndex + this.itemsPerPage);
  }
}
