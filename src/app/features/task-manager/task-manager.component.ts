import { Component } from '@angular/core';

@Component({
  selector: 'app-task-manager',
  templateUrl: './task-manager.component.html',
  styleUrls: ['./task-manager.component.css'] // <-- fix here
})
export class TaskManagerComponent {
  isSidebarOpen: boolean = false;
  isTaskModalOpen: boolean = false;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    console.log('Sidebar state:', this.isSidebarOpen); // Debugging log
  }


  closeTaskModal() {
    this.isTaskModalOpen = false;
  }
  openTaskModal() {
  console.log("Open task modal clicked");
  this.isTaskModalOpen = true;
}

}
