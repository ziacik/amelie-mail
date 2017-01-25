import { Component, OnInit } from '@angular/core';
import { AppStateService } from './shared/app-state.service';
import { MailService } from './shared/mail.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
	private editorVisible: boolean;

	constructor(private appStateService: AppStateService, private mailService: MailService) {
		this.editorVisible = false;
	}

	ngOnInit() {
	}

	private compose() {
		this.editorVisible = !this.editorVisible;
		// jQuery('#xeditor').modal('show');
	}
}
