import { Component, OnInit } from '@angular/core';
import { ServiceAuthService } from '../../service/service-auth.service';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrl: './file-manager.component.css'


})
export class FileManagerComponent implements OnInit {
  files: any[] = [];
  newFile: any = {};
  fileIdToDelete: string | null = null;
  fileToEdit: any = {};
  originalFileData: any = {}; // Add this lin

  
    
      constructor(
        private serviceAuthService: ServiceAuthService,
        private toastr: ToastrService // Add this line

  ) { }

  ngOnInit(): void {
    this.loadfiles();
  }

  loadfiles() {
    this.serviceAuthService.getFilesFromAPI()
      .subscribe((data: any) => {
        this.files = data;
      }, error => {
        console.error(error);
      this.toastr.error('Failed to load file.', 'Error');

      });
  }
  getStars(rating: number): Array<number> {
    return new Array(rating);
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
    console.log('Submitting form...');
    console.log('New File Data:', this.newFile);
    const formData = new FormData();
    Object.keys(this.newFile).forEach(key => {
      formData.append(key, this.newFile[key]);
    });
    this.serviceAuthService.createFile(formData)
      .subscribe((response: any) => {
        console.log('File created successfully:', response);
        // Optionally, refresh the file list
        this.loadfiles();
        // Clear the form after submission
        this.newFile = {};
      }, error => {
        console.error('Error creating file:', error);
      });
  }


  setFileToDelete(file: any) {
    this.fileIdToDelete = file._id ? file._id : null; // This ensures you're saving a valid ObjectId
  }
  

  deleteFile(id?: string) {
    if (id) {
      this.serviceAuthService.deleteFile(id).subscribe((response: any) => {
        console.log('File deleted successfully:', response);
        this.toastr.success('File deleted successfully!', 'Success');
        this.loadfiles();
        this.fileIdToDelete = null;
      }, error => {
        console.error('Error deleting file:', error);
        this.toastr.error('Failed to delete file.', 'Error');
      });
    }
  }

  editFile(file: any) {
    this.fileToEdit = { ...file };
    this.originalFileData = { ...file }; // Save the original File data for comparison
  }

  fileEditFile(event: any, key: string) {
    const file = event.target.files[0];
    if (file) {
      this.fileToEdit[key] = file;
    }
  }

  hasChanges(): boolean {
    // Compare original File data with the current fileToEdit data
    return JSON.stringify(this.fileToEdit) !== JSON.stringify(this.originalFileData);
  }

  updateFile() {
    if (!this.hasChanges()) {
      // No changes detected
      this.toastr.error('No changes detected. Please modify the File details before saving.', 'Error');
      return;
    }

    const formData = new FormData();
    Object.keys(this.fileToEdit).forEach(key => {
      formData.append(key, this.fileToEdit[key]);
    });

    this.serviceAuthService.updateFile(this.fileToEdit._id, formData).subscribe((response: any) => {
      console.log('File updated successfully:', response);
      this.toastr.success('File updated successfully!', 'Success');
      this.loadfiles();
      this.fileToEdit = {};
      this.originalFileData = {}; // Clear original data
    }, error => {
      console.error('Error updating file:', error);
      this.toastr.error('Failed to update file.', 'Error');
    });
  }


}



