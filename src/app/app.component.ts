import { Component, OnInit } from '@angular/core';
import { AppStateService } from './shared/app-state.service';
import { MailService } from './shared/mail.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	constructor(private appStateService: AppStateService, private mailService: MailService) {
	}

	ngOnInit() {
	}
}
