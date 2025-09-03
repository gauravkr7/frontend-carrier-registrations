import { Component } from '@angular/core';
import { ServiceAuthService } from './service/service-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'myTaskMandayCompleteThisProject';
  constructor(private userIdleService: ServiceAuthService) {}

}
