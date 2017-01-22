import { Component, OnInit } from '@angular/core';

import { AppStateService } from '../shared/app-state.service';

@Component({
	selector: 'app-mail-header',
	templateUrl: './mail-header.component.html',
	styleUrls: ['./mail-header.component.css']
})
export class MailHeaderComponent implements OnInit {
	constructor(private appStateService: AppStateService) {
	}

	ngOnInit() {
	}

	private getActiveMail(): any {
		return this.appStateService.getActiveMail();
	}

	// TODO should refactor to make this dry (move to Mail)
	private getFromDisplayNames() {
		let mail = this.getActiveMail();

		if (!mail.from || !mail.from.length) {
			return 'Unknown';
		} else {
			return mail.from.map(from => from.name || from.address || 'Unknown').join(', ');
		}
	}

	// TODO should refactor to make this dry (move to Mail)
	private getToDisplayNames() {
		let mail = this.getActiveMail();

		let recipients = (mail.to || []).concat(mail.cc || []);

		if (!recipients.length) {
			return '';
		} else {
			return recipients.map(to => to.name || to.address || 'Unknown').join(', ');
		}
	}
}
